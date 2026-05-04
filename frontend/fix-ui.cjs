const fs = require('fs');

const FILE = "c:\\Users\\marlo\\Desktop\\capstest\\frontend\\src\\components\\gad\\GADProposalManager.vue";
let content = fs.readFileSync(FILE, 'utf8');

const targetPrefix = "            <!-- Your Proposals (Right - Takes 3 cols) -->";
const targetSuffix = "</template>";

if (content.includes(targetPrefix) && content.includes(targetSuffix)) {
    const prefix = content.substring(0, content.indexOf(targetPrefix));
    
    // Reverse search for last </template>
    const suffixIndex = content.lastIndexOf(targetSuffix);
    let suffix = content.substring(suffixIndex + targetSuffix.length);

    const NEW_TEMPLATE = `            <!-- Your Proposals (Right - Takes 3 cols) -->
            <div class="lg:col-span-3 space-y-6">
                <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <h2 class="text-sm font-semibold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">2</span>
                        Your Submission History
                    </h2>
                    <span class="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-full">
                        {{ proposals.length }} Record(s)
                    </span>
                </div>

                <div v-if="proposals.length === 0" class="text-center py-20 bg-slate-800/40 rounded-xl border border-dashed border-slate-700/60">
                    <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <FileIcon class="w-8 h-8 text-slate-500" />
                    </div>
                    <p class="text-slate-300 font-semibold mb-1">No Proposals Submitted</p>
                    <p class="text-sm text-slate-500">Your proposal submissions will appear here.</p>
                </div>

                <div v-for="proposal in proposals" :key="proposal.id" class="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-sm transition-all hover:bg-slate-800 hover:border-slate-600 group">
                    <!-- Header -->
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-slate-100 mb-1 leading-snug">{{ proposal.title }}</h3>
                            <p class="text-sm text-slate-400">{{ proposal.campus?.name }} • {{ formatDate(proposal.submission_date) }}</p>
                        </div>
                        <span :class="getStatusColor(proposal.status)" class="px-3 py-1 rounded text-xs font-medium border flex-shrink-0 self-start sm:self-auto text-center">
                            {{ formatStatus(proposal.status) }}
                        </span>
                    </div>

                    <!-- Meta Quick Stats -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-5">
                        <div class="flex flex-col gap-1">
                            <p class="text-slate-500 font-semibold uppercase tracking-wider">Doc Uploaded?</p>
                            <p :class="proposal.file_key ? 'text-emerald-400 font-medium' : 'text-slate-400'">{{ proposal.file_key ? 'Yes' : 'No' }}</p>
                        </div>
                        <div class="flex flex-col gap-1">
                            <p class="text-slate-500 font-semibold uppercase tracking-wider">Lang Quality</p>
                            <p class="text-slate-200">{{ proposal.gfl_score ? \`\${proposal.gfl_score}%\` : 'Pending' }}</p>
                        </div>
                        <div class="flex flex-col gap-1 col-span-2 sm:col-span-2">
                            <p class="text-slate-500 font-semibold uppercase tracking-wider">Evaluation Score</p>
                            <p class="text-purple-400 font-medium">
                                <span v-if="proposal.total_score !== undefined">{{ proposal.total_score }} / {{ proposal.max_score }}</span>
                                <span v-else class="text-slate-400">Unscored</span>
                            </p>
                        </div>
                    </div>

                    <!-- Admin Feedback Block -->
                    <div v-if="proposal.admin_feedback" class="mb-5 bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                        <p class="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            WGAD Office Feedback
                        </p>
                        <p class="text-sm text-blue-100/80 leading-relaxed">{{ proposal.admin_feedback }}</p>
                    </div>

                    <!-- Document Upload Section -->
                    <div class="border-t border-slate-700/60 pt-5 space-y-3">
                        <div class="flex items-center justify-between mb-3">
                            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <FileIcon class="w-3.5 h-3.5" />
                                Supporting Document
                            </p>
                        </div>

                        <!-- Current Document -->
                        <div v-if="proposal.file_key" class="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="text-center sm:text-left min-w-0">
                                <p class="text-sm font-medium text-emerald-300 font-mono truncate">{{ proposal.file_key.split('/').pop() }}</p>
                            </div>
                            <button
                                @click="openDocumentViewer(proposal)"
                                class="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold rounded-md transition-colors text-xs"
                            >
                                Read Document
                            </button>
                        </div>

                        <!-- Upload Area -->
                        <div v-if="!proposal.file_key" class="space-y-3">
                            <div 
                                @dragover.prevent="activeDragProposal = proposal.id"
                                @dragleave="activeDragProposal = null"
                                @drop="handleDrop($event, proposal.id)"
                                class="relative border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer text-center"
                                :class="activeDragProposal === proposal.id ? 'border-blue-400 bg-blue-500/5' : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'"
                            >
                                <FileIcon class="w-6 h-6 mx-auto mb-2" :class="activeDragProposal === proposal.id ? 'text-blue-400' : 'text-slate-500'" />
                                <p class="text-sm font-medium text-slate-300 mb-1">Click or drag document to attach</p>
                                <p class="text-xs text-slate-500">Supports PDF and Word formats up to 50MB</p>
                                <input 
                                    type="file"
                                    @change="handleFileSelect($event, proposal.id)"
                                    accept=".pdf,.doc,.docx"
                                    class="absolute inset-0 opacity-0 cursor-pointer"
                                    :id="\`file-input-\${proposal.id}\`"
                                />
                            </div>

                            <!-- File Preview -->
                            <div v-if="pendingFiles[proposal.id]" class="bg-slate-900 border border-slate-700/80 p-3 rounded-lg flex items-center justify-between shadow-sm">
                                <div class="flex items-center gap-3">
                                    <FileIcon class="w-4 h-4 text-blue-400" />
                                    <div class="text-xs">
                                        <p class="font-medium text-slate-200">{{ pendingFiles[proposal.id].name }}</p>
                                        <p class="text-slate-500 mt-0.5">{{ formatFileSize(pendingFiles[proposal.id].size) }}</p>
                                    </div>
                                </div>
                                <button 
                                    @click="pendingFiles[proposal.id] = null"
                                    class="text-slate-500 hover:text-rose-400 p-1 rounded"
                                >
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <!-- Upload Button -->
                            <div class="flex gap-2 mt-2">
                                <button 
                                    @click="$refs[\`fileButton-\${proposal.id}\`]?.[0]?.click()"
                                    class="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileIcon class="w-3.5 h-3.5" />
                                    Choose File
                                </button>
                                <button 
                                    v-if="pendingFiles[proposal.id]"
                                    @click="uploadDocument(proposal.id)"
                                    :disabled="uploading[proposal.id]"
                                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {{ uploading[proposal.id] ? 'Uploading...' : 'Upload' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>`;

    const finalContent = prefix + NEW_TEMPLATE + "\n" + suffix;
    fs.writeFileSync(FILE, finalContent, 'utf8');
    console.log("Success!");
} else {
    console.log("Prefix or Suffix not found!");
}
