const { Op } = require('sequelize');
const { ResourceItem, Campus, User, UserResourceDismissal, UserRecommendedResourceDismissal } = require('../model');

const parsePositiveInt = (value, fallback) => {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
	return parsed;
};

const isNoSuchTableError = (error) => {
	const code = error?.original?.code || error?.parent?.code || error?.code;
	if (code === 'ER_NO_SUCH_TABLE') return true;
	const msg = String(error?.original?.message || error?.message || '');
	return msg.toLowerCase().includes("doesn't exist");
};

const safeHost = (rawUrl) => {
	try {
		return new URL(String(rawUrl)).hostname.replace(/^www\./, '');
	} catch {
		return '';
	}
};

const inferContentKind = (item) => {
	if (!item) return 'article';
	if (String(item.source || '').toLowerCase() === 'youtube') return 'video';
	const host = safeHost(item.link_url);
	if (!host) return 'article';
	if (host.includes('youtube.com') || host.includes('youtu.be') || host.includes('vimeo.com')) return 'video';
	return 'article';
};

exports.getResources = async (req, res, next) => {
	try {
		const { campus_id, type, search } = req.query;
		const where = {};

		if (type) {
			where.type = type;
		}

		if (campus_id) {
			where[Op.or] = [{ campus_id }, { campus_id: null }];
		}

		if (search) {
			where.title = { [Op.like]: `%${search}%` };
		}

		const resources = await ResourceItem.findAll({
			where,
			include: [
				{ model: Campus, as: 'campus', attributes: ['id', 'name'] },
				{ model: User, as: 'creator', attributes: ['id', 'name'] }
			],
			order: [['created_at', 'DESC']]
		});

		res.json({ resources });
	} catch (error) {
		next(error);
	}
};

exports.createResource = async (req, res, next) => {
	try {
		const { title, description, type, link_url, campus_id } = req.body;

		if (!title || !link_url) {
			return res.status(400).json({ message: 'Title and link URL are required.' });
		}

		const resource = await ResourceItem.create({
			title: String(title).trim(),
			description: description ? String(description).trim() : null,
			type: type || 'other',
			link_url: String(link_url).trim(),
			campus_id: campus_id || null,
			created_by: req.user?.id || null
		});

		res.status(201).json({ message: 'Resource created.', resource });
	} catch (error) {
		next(error);
	}
};

exports.getRecommendedResources = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'Unauthorized' });

		const limit = Math.min(parsePositiveInt(req.query.limit, 8), 40);
		const page = Math.min(parsePositiveInt(req.query.page, 1), 10_000);
		const sort = String(req.query.sort || 'newest');
		const content = String(req.query.content || 'all');

		// Dismissals (multi-source)
		let dismissedKeys = new Set();
		try {
			const dismissedKeyRows = await UserRecommendedResourceDismissal.findAll({
				where: { user_id: userId },
				attributes: ['item_key']
			});
			dismissedKeys = new Set(dismissedKeyRows.map(r => r.item_key));
		} catch (error) {
			if (!isNoSuchTableError(error)) throw error;
		}

		// Backwards compatibility: also treat legacy resource_item dismissals as dismissed keys
		try {
			const legacyDismissed = await UserResourceDismissal.findAll({
				where: { user_id: userId },
				attributes: ['resource_item_id']
			});
			for (const row of legacyDismissed) {
				dismissedKeys.add(`resource_item:${row.resource_item_id}`);
			}
		} catch (error) {
			if (!isNoSuchTableError(error)) throw error;
		}

		const stripHtml = (text) => String(text || '').replace(/<[^>]*>/g, '').trim();
		const uniqByKey = (items) => {
			const seen = new Set();
			const out = [];
			for (const it of items) {
				if (!it || !it.key) continue;
				if (seen.has(it.key)) continue;
				seen.add(it.key);
				out.push(it);
			}
			return out;
		};

		// Simple in-memory cache (per-process)
		const CACHE_TTL_MS = 15 * 60 * 1000;
		global.__recommendedResourceCache = global.__recommendedResourceCache || new Map();
		const cacheKey = `v1:${process.env.YOUTUBE_API_KEY ? 'yt' : 'no-yt'}`;
		const cached = global.__recommendedResourceCache.get(cacheKey);
		const now = Date.now();

		let allItems;
		if (cached && (now - cached.at) < CACHE_TTL_MS) {
			allItems = cached.items;
		} else {
			const topics = [
				'Violence Against Women and Children (VAWC) Philippines',
				'Gender and Development (GAD) Philippines',
				'Sex education consent and healthy relationships'
			];

			// 1) Resource Center (DB)
			const dbResources = await ResourceItem.findAll({
				include: [
					{ model: Campus, as: 'campus', attributes: ['id', 'name'] },
					{ model: User, as: 'creator', attributes: ['id', 'name'] }
				],
				order: [['created_at', 'DESC']],
				limit: 30
			});

			const dbItems = dbResources.map(r => ({
				key: `resource_item:${r.id}`,
				id: r.id,
				title: r.title,
				description: r.description,
				type: r.type,
				link_url: r.link_url,
				created_at: r.created_at,
				source: 'Resource Center'
			}));

			// 2) Wikipedia (no key)
			const wikiFetches = topics.map(async (topic) => {
				const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=4&srsearch=${encodeURIComponent(topic)}`;
				const resp = await fetch(url, { headers: { 'User-Agent': 'ProtectEd/1.0 (recommended-resources)' } });
				if (!resp.ok) return [];
				const data = await resp.json();
				const results = data?.query?.search || [];
				return results.map((row) => ({
					key: `wikipedia:${row.pageid}`,
					title: stripHtml(row.title),
					description: stripHtml(row.snippet),
					type: 'guide',
					link_url: `https://en.wikipedia.org/?curid=${row.pageid}`,
					created_at: new Date().toISOString(),
					source: 'Wikipedia'
				}));
			});
			const wikiItems = (await Promise.allSettled(wikiFetches))
				.flatMap(r => (r.status === 'fulfilled' ? r.value : []));

			// 3) YouTube (optional, requires YOUTUBE_API_KEY)
			let ytItems = [];
			if (process.env.YOUTUBE_API_KEY) {
				const ytFetches = topics.map(async (topic) => {
					const url = new URL('https://www.googleapis.com/youtube/v3/search');
					url.searchParams.set('part', 'snippet');
					url.searchParams.set('type', 'video');
					url.searchParams.set('maxResults', '4');
					url.searchParams.set('q', topic);
					url.searchParams.set('safeSearch', 'strict');
					url.searchParams.set('key', process.env.YOUTUBE_API_KEY);

					const resp = await fetch(url.toString());
					if (!resp.ok) return [];
					const data = await resp.json();
					const items = data?.items || [];
					return items
						.map((it) => {
							const videoId = it?.id?.videoId;
							const sn = it?.snippet;
							if (!videoId || !sn?.title) return null;
							return {
								key: `youtube:${videoId}`,
								title: stripHtml(sn.title),
								description: stripHtml(sn.description),
								type: 'talk',
								link_url: `https://www.youtube.com/watch?v=${videoId}`,
								created_at: sn.publishedAt || new Date().toISOString(),
								source: 'YouTube'
							};
						})
						.filter(Boolean);
				});
				ytItems = (await Promise.allSettled(ytFetches))
					.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
			}

			allItems = uniqByKey([...dbItems, ...wikiItems, ...ytItems]).map((it) => ({
				...it,
				content_kind: inferContentKind(it)
			}));
			global.__recommendedResourceCache.set(cacheKey, { at: now, items: allItems });
		}

		// Filter dismissed
		let items = allItems.filter(it => !dismissedKeys.has(it.key));

		// Filter by content kind
		if (content === 'video') items = items.filter((it) => it.content_kind === 'video');
		else if (content === 'article') items = items.filter((it) => it.content_kind === 'article');

		// Sort
		if (sort === 'title_asc') items.sort((a, b) => String(a.title).localeCompare(String(b.title)));
		else if (sort === 'title_desc') items.sort((a, b) => String(b.title).localeCompare(String(a.title)));
		else if (sort === 'type') items.sort((a, b) => String(a.type).localeCompare(String(b.type)));
		else if (sort === 'source') items.sort((a, b) => String(a.source).localeCompare(String(b.source)));
		else {
			items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		}

		const total = items.length;
		const offset = (page - 1) * limit;
		const paged = items.slice(offset, offset + limit);
		const hasMore = offset + limit < total;

		res.json({
			resources: paged,
			meta: {
				page,
				limit,
				total,
				hasMore
			}
		});
	} catch (error) {
		next(error);
	}
};

exports.dismissRecommendedResourceByKey = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'Unauthorized' });

		const itemKey = String(req.body?.key || '').trim();
		if (!itemKey) return res.status(400).json({ message: 'Missing key' });
		if (itemKey.length > 255) return res.status(400).json({ message: 'Key too long' });

		await UserRecommendedResourceDismissal.upsert({
			user_id: userId,
			item_key: itemKey,
			dismissed_at: new Date()
		});

		res.json({ message: 'Resource removed from suggestions.' });
	} catch (error) {
		next(error);
	}
};

exports.dismissRecommendedResource = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: 'Unauthorized' });

		const resourceId = Number.parseInt(req.params.resourceId, 10);
		if (!Number.isFinite(resourceId)) {
			return res.status(400).json({ message: 'Invalid resource id' });
		}

		const resource = await ResourceItem.findByPk(resourceId);
		if (!resource) return res.status(404).json({ message: 'Resource not found' });

		// Store legacy dismissal (resource item id) and multi-source key for consistency
		await UserResourceDismissal.upsert({
			user_id: userId,
			resource_item_id: resourceId,
			dismissed_at: new Date()
		});
		await UserRecommendedResourceDismissal.upsert({
			user_id: userId,
			item_key: `resource_item:${resourceId}`,
			dismissed_at: new Date()
		});

		res.json({ message: 'Resource removed from suggestions.' });
	} catch (error) {
		next(error);
	}
};
