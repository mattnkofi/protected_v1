// backend/src/services/GenderFairLanguageService.js
/**
 * Gender-Fair Language (GFL) Auditor Service
 * Analyzes text for non-inclusive language and suggests improvements
 */

class GenderFairLanguageService {
    constructor() {
        // Dictionary of gendered/non-inclusive terms and their inclusive alternatives
        this.flaggedTerms = {
            'chairman': { suggestion: 'chairperson', severity: 'high', category: 'gender-specific' },
            'chairwoman': { suggestion: 'chairperson', severity: 'high', category: 'gender-specific' },
            'chairman/woman': { suggestion: 'chairperson', severity: 'high', category: 'gender-specific' },
            'spokesman': { suggestion: 'spokesperson', severity: 'high', category: 'gender-specific' },
            'spokeswoman': { suggestion: 'spokesperson', severity: 'high', category: 'gender-specific' },
            'spokesman/woman': { suggestion: 'spokesperson', severity: 'high', category: 'gender-specific' },
            'policeman': { suggestion: 'police officer', severity: 'high', category: 'gender-specific' },
            'policemen': { suggestion: 'police officer', severity: 'high', category: 'gender-specific' },
            'policewoman': { suggestion: 'police officer', severity: 'high', category: 'gender-specific' },
            'firemen': { suggestion: 'firefighter', severity: 'high', category: 'gender-specific' },
            'fireman': { suggestion: 'firefighter', severity: 'high', category: 'gender-specific' },
            'firewoman': { suggestion: 'firefighter', severity: 'high', category: 'gender-specific' },
            'cameraman': { suggestion: 'camera operator', severity: 'high', category: 'gender-specific' },
            'saleswoman': { suggestion: 'sales representative', severity: 'high', category: 'gender-specific' },
            'salesman': { suggestion: 'sales representative', severity: 'high', category: 'gender-specific' },
            'stewardess': { suggestion: 'flight attendant', severity: 'high', category: 'gender-specific' },
            'steward': { suggestion: 'flight attendant', severity: 'medium', category: 'gender-specific' },
            'mankind': { suggestion: 'humankind, people, humans', severity: 'medium', category: 'all-male' },
            'man-made': { suggestion: 'synthetic, artificial', severity: 'medium', category: 'all-male' },
            'manpower': { suggestion: 'workforce, human resources', severity: 'medium', category: 'all-male' },
            'manpower resources': { suggestion: 'human resources', severity: 'medium', category: 'all-male' },
            'the man on the street': { suggestion: 'the average person', severity: 'medium', category: 'all-male' },
            'businessman': { suggestion: 'businessperson, executive', severity: 'high', category: 'gender-specific' },
            'businesswoman': { suggestion: 'businessperson, executive', severity: 'high', category: 'gender-specific' },
            'craftsman': { suggestion: 'craftsperson, artisan', severity: 'high', category: 'gender-specific' },
            'craftsmen': { suggestion: 'craftspeople, artisans', severity: 'high', category: 'gender-specific' },
            'councilman': { suggestion: 'council member', severity: 'high', category: 'gender-specific' },
            'councilwoman': { suggestion: 'council member', severity: 'high', category: 'gender-specific' },
            'congressman': { suggestion: 'member of congress, representative', severity: 'high', category: 'gender-specific' },
            'congresswoman': { suggestion: 'member of congress, representative', severity: 'high', category: 'gender-specific' },
            'mailman': { suggestion: 'mail carrier, postal worker', severity: 'high', category: 'gender-specific' },
            'deliveryman': { suggestion: 'delivery worker', severity: 'high', category: 'gender-specific' },
            'housewife': { suggestion: 'homemaker', severity: 'medium', category: 'gender-specific' },
            'repairman': { suggestion: 'repair worker, technician', severity: 'high', category: 'gender-specific' },
            'repairwoman': { suggestion: 'repair worker, technician', severity: 'high', category: 'gender-specific' },
            'workman': { suggestion: 'worker', severity: 'high', category: 'gender-specific' },
            'workmanlike': { suggestion: 'professional, skilled', severity: 'medium', category: 'gender-specific' },
            'layman': { suggestion: 'layperson', severity: 'high', category: 'gender-specific' },
            'laywoman': { suggestion: 'layperson', severity: 'high', category: 'gender-specific' },
            'gentleman\'s agreement': { suggestion: 'informal agreement', severity: 'low', category: 'gender-specific' },
            'sportsmanship': { suggestion: 'good sportsmanship, fair play', severity: 'low', category: 'gender-specific' },
            'craftsmanship': { suggestion: 'artistry, skill', severity: 'low', category: 'gender-specific' },
            'leadership': { suggestion: 'leadership (already neutral)', severity: 'none', category: 'suggestion' }, // neutral
            'he/she': { suggestion: 'they', severity: 'medium', category: 'pronoun' },
            'his/her': { suggestion: 'their', severity: 'medium', category: 'pronoun' },
            'him/her': { suggestion: 'them', severity: 'medium', category: 'pronoun' },
            'man': { suggestion: 'person, individual (context-dependent)', severity: 'low', category: 'context-dependent' },
            'woman': { suggestion: 'person, individual (context-dependent)', severity: 'low', category: 'context-dependent' },
            'women': { suggestion: 'person, individual (context-dependent)', severity: 'low', category: 'context-dependent' },
            'men': { suggestion: 'people, individuals (context-dependent)', severity: 'low', category: 'context-dependent' },
            'guys': { suggestion: 'folks, people, friends, team (context-dependent)', severity: 'low', category: 'context-dependent' },
            'girls': { suggestion: 'women, team members (context-dependent)', severity: 'low', category: 'context-dependent' }
        };

        this.offensiveTerms = {
            'idiot': { suggestion: 'use respectful language', severity: 'medium', category: 'offensive' },
            'stupid': { suggestion: 'use respectful language', severity: 'medium', category: 'offensive' },
            'moron': { suggestion: 'use respectful language', severity: 'medium', category: 'offensive' },
            'dumb': { suggestion: 'use respectful language', severity: 'medium', category: 'offensive' }
        };

        this.registerCustomOffensiveTerms();

        // Patterns for additional checks
        this.patterns = {
            // Outdated marital status references (high priority for gender fairness)
            'mrs.': { suggestion: 'use Ms. or just name', severity: 'medium', category: 'marital-status' },
            'miss': { suggestion: 'use Ms. or just name', severity: 'medium', category: 'marital-status' }
        };
    }

    /**
     * Analyze text for gender-fair language issues
     * @param {string} text - The text to analyze
     * @returns {object} Analysis results with issues and suggestions
     */
    analyzeText(text) {
        if (!text || typeof text !== 'string') {
            return {
                success: false,
                error: 'Invalid text input',
                issues: [],
                totalIssues: 0,
                gflScore: 0,
                summary: { totalIssues: 0, bySeverity: { high: 0, medium: 0, low: 0 }, byCategory: {} }
            };
        }

        const issues = [];
        const detectedPositions = new Set();
        
        this.scanTermDictionary(
            text,
            this.flaggedTerms,
            issues,
            detectedPositions,
            'gender-fair-language',
            (match, data) => `"${match}" may not be gender-inclusive. Consider using "${data.suggestion}" instead.`
        );
        this.scanTermDictionary(
            text,
            this.offensiveTerms,
            issues,
            detectedPositions,
            'offensive-language',
            (match, data) => `"${match}" may not be appropriate. Consider using "${data.suggestion}" instead.`
        );

        // Check for generic masculine pronouns - with stricter context
        const pronounPatterns = [
            { 
                pattern: /\bhis\b/gi, 
                suggestion: 'their', 
                category: 'pronoun',
                contextCheck: (before) => /\ba\s\w+\s|an\s\w+\s|every\s\w+\s|each\s\w+\s|someone|everyone|nobody|anybody/.test(before)
            },
            { 
                pattern: /\bhe\b/gi, 
                suggestion: 'they', 
                category: 'pronoun',
                contextCheck: (before) => /\ba\s\w+\s|an\s\w+\s|every\s\w+\s|each\s\w+\s|someone|everyone|nobody|anybody/.test(before)
            }
        ];

        for (const pattern of pronounPatterns) {
            let match;
            const localRegex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
            
            while ((match = localRegex.exec(text)) !== null) {
                const startPos = match.index;
                const endPos = match.index + match[0].length;
                const key = `${startPos}-${endPos}`;
                
                if (detectedPositions.has(key)) continue;
                
                const context = this.getContext(text, startPos, endPos);
                
                // Only flag if context strongly suggests generic masculine usage
                if (pattern.contextCheck(context.before)) {
                    detectedPositions.add(key);
                    issues.push({
                        type: 'generic-pronoun',
                        term: match[0],
                        suggestion: pattern.suggestion,
                        severity: 'low',
                        category: pattern.category,
                        position: { start: startPos, end: endPos },
                        context: context,
                        message: `Generic masculine pronoun "${match[0]}" found. Consider using "${pattern.suggestion}" for inclusivity.`
                    });
                }
            }
        }

        // Sort issues by position
        issues.sort((a, b) => a.position.start - b.position.start);

        return {
            success: true,
            totalIssues: issues.length,
            issues: issues,
            summary: this.generateSummary(issues),
            gflScore: this.calculateGFLScore(issues, text.length)
        };
    }

    /**
     * Get context around a flagged term
     * @private
     */
    getContext(text, startPos, endPos, contextLength = 40) {
        const before = text.substring(Math.max(0, startPos - contextLength), startPos);
        const after = text.substring(endPos, Math.min(text.length, endPos + contextLength));
        return { before, after };
    }

    /**
     * Generate summary of issues
     * @private
     */
    generateSummary(issues) {
        const summary = {
            totalIssues: issues.length,
            bySeverity: { high: 0, medium: 0, low: 0, none: 0 },
            byCategory: {}
        };

        issues.forEach(issue => {
            summary.bySeverity[issue.severity]++;
            summary.byCategory[issue.category] = (summary.byCategory[issue.category] || 0) + 1;
        });

        return summary;
    }

    /**
     * Calculate Gender-Fair Language Score (0-100)
     * @private
     */
    calculateGFLScore(issues, textLength) {
        if (textLength === 0) return 100;
        
        // Weight issues by severity
        let issueWeight = 0;
        issues.forEach(issue => {
            switch (issue.severity) {
                case 'high': issueWeight += 5; break;
                case 'medium': issueWeight += 3; break;
                case 'low': issueWeight += 1; break;
                default: issueWeight += 0;
            }
        });

        // Normalize to 0-100 scale (base on density of issues)
        const density = issueWeight / (textLength / 100);
        const score = Math.max(0, 100 - density);
        
        return Math.round(score * 10) / 10; // Round to 1 decimal
    }

    registerCustomOffensiveTerms() {
        const rawTerms = process.env.GFL_OFFENSIVE_TERMS;
        if (!rawTerms) return;

        rawTerms
            .split(',')
            .map(term => term.trim().toLowerCase())
            .filter(term => term.length > 0)
            .forEach(term => {
                if (!this.offensiveTerms[term]) {
                    this.offensiveTerms[term] = {
                        suggestion: 'use respectful language',
                        severity: 'medium',
                        category: 'offensive'
                    };
                }
            });
    }

    scanTermDictionary(text, terms, issues, detectedPositions, type, messageBuilder) {
        const sortedTerms = Object.entries(terms).sort((a, b) => b[0].length - a[0].length);

        for (const [term, data] of sortedTerms) {
            const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
            let match;

            while ((match = regex.exec(text)) !== null) {
                const key = `${match.index}-${match.index + match[0].length}`;

                if (detectedPositions.has(key)) continue;
                detectedPositions.add(key);

                const startPos = match.index;
                const endPos = match.index + match[0].length;

                issues.push({
                    type,
                    term: match[0],
                    suggestion: data.suggestion,
                    severity: data.severity,
                    category: data.category,
                    position: { start: startPos, end: endPos },
                    context: this.getContext(text, startPos, endPos),
                    message: messageBuilder(match[0], data)
                });
            }
        }
    }

    /**
     * Get suggestions for improving GFL compliance
     */
    getSuggestions(issues) {
        const suggestions = {
            immediate: [],
            recommended: [],
            optional: []
        };

        issues.forEach(issue => {
            const suggestion = {
                original: issue.term,
                suggested: issue.suggestion,
                category: issue.category,
                reasoning: this.getReasoningForTerm(issue.term, issue.category)
            };

            if (issue.severity === 'high') {
                suggestions.immediate.push(suggestion);
            } else if (issue.severity === 'medium') {
                suggestions.recommended.push(suggestion);
            } else {
                suggestions.optional.push(suggestion);
            }
        });

        return suggestions;
    }

    /**
     * Get reasoning for why a term should be changed
     * @private
     */
    getReasoningForTerm(term, category) {
        const reasoning = {
            'gender-specific': 'This term is gender-specific and may exclude or misrepresent individuals of other genders.',
            'all-male': 'This term uses masculine language as a universal reference, which can exclude other genders.',
            'pronoun': 'Using singular they/them pronouns is more inclusive than he/she or his/her.',
            'marital-status': 'Revealing marital status is not necessary and may be discriminatory. Use neutral titles.',
            'context-dependent': 'This term may be acceptable in context but should be reviewed for inclusivity.'
        };
        
        return reasoning[category] || 'This term may not be gender-inclusive.';
    }
}

module.exports = new GenderFairLanguageService();
