<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import gsap from 'gsap'

const inputMessage = ref('')
const isProcessing = ref(false)
const chatHistory = ref([])
const currentTopic = ref('GRAMMATIK-RECHTSCHREIBUNG')
const currentTheory = ref(`// INITIALISIEREN...\n\nGuten Tag! Saya adalah algoritma eksekusi Grammatik.\n\nKetik kalimat bahasa Jerman Anda di bawah. Jika Anda melakukan kesalahan fatal pada Artikel (der/die/das) atau Kasus (Akkusativ/Dativ), saya akan menghancurkan argumen Anda tanpa ampun.`)

const arenaRef = ref(null)
const inputRef = ref(null)
const chatContainerRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const triggerVetoShake = () => {
  gsap.to(arenaRef.value, {
    x: () => gsap.utils.random(-25, 25),
    y: () => gsap.utils.random(-10, 10),
    rotation: () => gsap.utils.random(-3, 3),
    duration: 0.05,
    repeat: 12,
    yoyo: true,
    ease: "rough",
    onComplete: () => { gsap.set(arenaRef.value, { x: 0, y: 0, rotation: 0 }) }
  })
  
  // Glitch flash
  gsap.fromTo(arenaRef.value, 
    { filter: "contrast(200%) hue-rotate(90deg) drop-shadow(0 0 20px red)" },
    { filter: "none", duration: 0.8, ease: "power4.out" }
  )
}

const triggerSuccessGlow = () => {
  gsap.fromTo(arenaRef.value, 
    { boxShadow: "inset 0 0 100px rgba(94, 234, 212, 0.4)" },
    { boxShadow: "none", duration: 1.5, ease: "power2.out" }
  )
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isProcessing.value) return
  
  const userText = inputMessage.value
  chatHistory.value.push({ role: 'user', content: userText })
  inputMessage.value = ''
  isProcessing.value = true
  await scrollToBottom()
  
  chatHistory.value.push({ role: 'system', content: 'ANALYZING_SYNTAX...', isLoading: true })
  await scrollToBottom()
  
  try {
    const response = await axios.post('https://taufiks-imac.tailb50867.ts.net/v1/german-tutor', {
      query: userText
    })
    
    chatHistory.value.pop()
    const result = response.data
    const isError = result.veto_status === "REJECT" || result.veto_status === "ERROR"
    
    if (result.grammar_topic) currentTopic.value = result.grammar_topic.toUpperCase()
    if (result.scholar_theory) currentTheory.value = result.scholar_theory
    
    // Animate left panel content refresh
    gsap.fromTo('.theory-box', 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    )
    
    chatHistory.value.push({ 
      role: 'system', 
      content: result.quiz_master_response || result.answer || 'SYNTAX_ERROR: INVALID_JSON',
      isError 
    })
    
    await scrollToBottom()
    
    if (isError) triggerVetoShake()
    else triggerSuccessGlow()
    
  } catch (error) {
    chatHistory.value.pop()
    chatHistory.value.push({ 
      role: 'system', 
      content: `KONEKSI_GAGAL: ${error.message}`,
      isError: true 
    })
    triggerVetoShake()
    await scrollToBottom()
  } finally {
    isProcessing.value = false
    nextTick(() => inputRef.value?.focus())
  }
}

onMounted(() => {
  gsap.from('.stagger-in', {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: "power3.out"
  })
})
</script>

<template>
  <div class="scanlines"></div>
  
  <div class="h-screen w-full flex flex-col bg-transparent relative z-10">
    
    <!-- TOP NAVIGATION BAR -->
    <header class="h-16 border-b-2 border-[#134e4a] bg-[#0c1012]/90 flex justify-between items-center px-6">
      <div class="flex items-center gap-4">
        <h1 class="font-[Teko] text-4xl text-neon-intense tracking-wide uppercase leading-none mt-2">
          DEUTSCH // KRIEG // LERNEN
        </h1>
      </div>
      <div class="flex gap-8 font-mono text-sm tracking-widest text-gray-400">
        <span class="hover:text-neon cursor-pointer transition-colors">LERNEN</span>
        <span class="text-neon border-b-2 border-brand-500 pb-1">QUIZ-ARENA</span>
        <span class="hover:text-neon cursor-pointer transition-colors">STATISTIKEN</span>
      </div>
    </header>

    <div class="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4 max-w-[1600px] w-full mx-auto">
      
      <!-- LEFT PANEL: THEORY (GRITTY METAL) -->
      <div class="w-full md:w-[40%] flex flex-col panel-metal cut-corner stagger-in relative">
        <div class="p-6 pb-2 border-b border-gray-800">
          <p class="text-gray-400 text-xs tracking-widest uppercase mb-1">GRAMMATIK-RECHTSCHREIBUNG</p>
          <h2 class="font-[Teko] text-5xl md:text-6xl text-neon-intense leading-none uppercase break-words hyphens-auto">
            {{ currentTopic }}
          </h2>
        </div>
        
        <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
          
          <!-- Decorative UI Element inside Theory -->
          <div class="bg-[#050708] border border-gray-800 p-4 mb-6 relative">
            <div class="absolute -top-3 left-4 bg-[#11171a] px-2 text-xs font-mono text-neon border border-gray-700 slanted-tab">SCHOLAR DATA</div>
            
            <div class="theory-box prose prose-invert max-w-none prose-p:font-mono prose-p:text-sm prose-p:leading-relaxed prose-p:text-gray-300 prose-code:text-neon prose-code:bg-[#000] prose-code:px-1 prose-code:border prose-code:border-gray-800">
              <p class="whitespace-pre-wrap">{{ currentTheory }}</p>
            </div>
          </div>
          
          <!-- Faux Tables for Aesthetic -->
          <div class="grid grid-cols-2 gap-4 mt-8 opacity-70">
            <div class="bg-black/50 border border-gray-800 p-3">
              <h4 class="text-xs text-brand-500 border-b border-gray-800 pb-1 mb-2">Präsens</h4>
              <p class="text-[10px] text-gray-400 leading-tight">
                ICH <span class="text-neon">STEHE</span> AUF<br/>
                DU <span class="text-neon">STEHST</span> AUF
              </p>
            </div>
            <div class="bg-black/50 border border-gray-800 p-3">
              <h4 class="text-xs text-brand-500 border-b border-gray-800 pb-1 mb-2">Präteritum</h4>
              <p class="text-[10px] text-gray-400 leading-tight">
                ICH <span class="text-neon">STAND</span> AUF<br/>
                DU <span class="text-neon">STANDST</span> AUF
              </p>
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- RIGHT PANEL: ARENA -->
      <div class="w-full md:w-[60%] flex flex-col relative stagger-in">
        
        <div class="flex justify-between items-end mb-2 px-2">
          <div class="bg-[#11171a] border border-[#134e4a] px-4 py-1 text-xs text-gray-400 slanted-tab">QUIZ-ARENA</div>
          <div class="text-[10px] text-brand-500 flex items-center gap-2">
            <div class="w-full max-w-[100px] h-1 bg-gray-800"><div class="h-full bg-brand-500 w-[60%]"></div></div>
            SYS.READY
          </div>
        </div>
        
        <div ref="arenaRef" class="flex-1 bg-black border border-[#134e4a] flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(19,78,74,0.3)]">
          
          <!-- Background Grid lines -->
          <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: linear-gradient(#134e4a 1px, transparent 1px), linear-gradient(90deg, #134e4a 1px, transparent 1px); background-size: 50px 50px;"></div>
          <div class="absolute top-0 bottom-0 left-1/2 w-px bg-brand-900/40 pointer-events-none"></div>
          
          <div ref="chatContainerRef" class="flex-1 p-6 overflow-y-auto custom-scrollbar relative z-10 flex flex-col gap-6">
            
            <div v-for="(msg, idx) in chatHistory" :key="idx" class="w-full flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              
              <!-- USER INPUT -->
              <div v-if="msg.role === 'user'" class="max-w-[80%] bg-[#0f172a] border border-[#1e293b] p-3 shadow-lg">
                <span class="text-[10px] text-gray-500 block mb-1">USER_INPUT</span>
                <p class="font-mono text-gray-200">{{ msg.content }}</p>
              </div>
              
              <!-- SYSTEM RESPONSE -->
              <div v-else class="w-full">
                <!-- Giant Question Aesthetic if it's the latest question -->
                <div v-if="idx === chatHistory.length - 1 && !msg.isError && !msg.isLoading" class="mb-6">
                  <h3 class="font-[Teko] text-5xl md:text-7xl text-neon-intense leading-none uppercase drop-shadow-[0_0_15px_rgba(94,234,212,0.8)]">
                    {{ msg.content.length < 50 ? msg.content : "ANTWORT ANALYSIERT." }}
                  </h3>
                </div>
                
                <div class="border-l-2 p-4 bg-[#050708]/80 backdrop-blur"
                     :class="msg.isError ? 'border-red-500' : 'border-brand-500'">
                  <div class="text-[10px] uppercase mb-2 flex items-center gap-2" :class="msg.isError ? 'text-red-500' : 'text-brand-500'">
                    <Icon v-if="msg.isError" icon="mdi:alert" class="text-sm" />
                    {{ msg.isError ? 'SYS.FATAL_ERROR' : 'SYS.RESPONSE' }}
                  </div>
                  
                  <p class="font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap"
                     :class="msg.isLoading ? 'animate-pulse text-gray-600' : ''">
                    <template v-if="idx === chatHistory.length - 1 && !msg.isError && !msg.isLoading && msg.content.length < 50">
                      <!-- Hide content if it's already shown as giant text -->
                      Bitte antworten Sie unten.
                    </template>
                    <template v-else>
                      {{ msg.content }}
                    </template>
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- INPUT COMPONENT -->
          <div class="p-4 bg-[#0a0f12] border-t border-[#134e4a] relative z-20">
            <form @submit.prevent="sendMessage" class="flex flex-col gap-2">
              <div class="relative">
                <Icon icon="mdi:console-line" class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500 opacity-50" />
                <input 
                  ref="inputRef"
                  v-model="inputMessage" 
                  type="text" 
                  :disabled="isProcessing"
                  class="w-full bg-[#050708] border border-[#134e4a] text-neon font-mono text-lg p-3 pl-10 focus:outline-none focus:border-brand-500 focus:bg-[#0a1114] transition-all disabled:opacity-50"
                  placeholder="[EINGABE]..."
                  autocomplete="off"
                />
              </div>
              <button 
                type="submit" 
                :disabled="!inputMessage.trim() || isProcessing"
                class="btn-brutal py-3 w-full text-center flex justify-center items-center gap-2"
              >
                {{ isProcessing ? 'VERARBEITUNG...' : 'NÄCHSTE FRAGE [NEXT]' }}
                <Icon v-if="isProcessing" icon="mdi:loading" class="animate-spin" />
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
/* Any additional component-specific styles */
</style>
