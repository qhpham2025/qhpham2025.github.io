/**
 * TwoSetViolin Fan Page - Custom JavaScript Logic
 * Includes:
 * 1. Mobile navigation menu drawer toggle.
 * 2. Light / Dark theme toggler with LocalStorage persistence.
 * 3. Ling Ling 40-Hours Practice Excuse / Quote Generator with fade animations.
 * 4. Synthesizer Violin Tuner utilizing Web Audio API for G, D, A, E strings.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. Mobile Navigation Menu Toggle
     ========================================================================== */
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNavToggle.classList.toggle('open');
      navMenu.classList.toggle('mobile-open');
    });

    // Close menu when a link is clicked
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavToggle.classList.remove('open');
        navMenu.classList.remove('mobile-open');
      });
    });
  }


  /* ==========================================================================
     2. Dark / Light Theme Toggle
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const htmlElement = document.documentElement;

  // Check for saved theme preference in localStorage, default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }


  /* ==========================================================================
     3. Ling Ling 40-Hours Excuse / Quote Generator
     ========================================================================== */
  const excuseQuotes = [
    {
      text: "Sorry, I can't go out tonight. Ling Ling said I only practised 39 hours today.",
      author: "Standard Excuse"
    },
    {
      text: "I am currently practicing violin with my left hand while preparing Mapo Tofu with my right hand.",
      author: "Brett's Cooking Protocol"
    },
    {
      text: "I must stay home. I am attempting to play Flight of the Bumblebee at 15 notes per second, but correctly.",
      author: "Sacrilegious Prevention"
    },
    {
      text: "I would hang out, but Editor-san is locked in the edit dungeon and I have to throw bubble tea through the bars.",
      author: "Editor-san Survival Mode"
    },
    {
      text: "I was going to practice, but then I realized my viola-playing neighbor might hear and get motivated. We can't have that.",
      author: "Viola Gang Deterrence"
    },
    {
      text: "Can't go out. I am currently converting bubble tea sugar levels directly into bow speed.",
      author: "Eddy's Science of Practice"
    },
    {
      text: "I failed my chemistry exam because I spent the duration calculating how to fit 40 hours of practice into a 24-hour day.",
      author: "Ling Ling Mathematics"
    },
    {
      text: "My violin teacher, Tiger Mum, locked the practice room door and took away my phone. She says my intonation is 'lamentable'.",
      author: "Family Pressure"
    },
    {
      text: "I cannot go out. My violin bridge is currently at a 91-degree angle, and I am in a state of existential panic.",
      author: "Lamentable Setups"
    },
    {
      text: "I would step outside, but my violin case has locked itself and will only open for a true prodigy. I need 2 more hours.",
      author: "Practice Lockout"
    }
  ];

  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const generateBtn = document.getElementById('generateBtn');

  let currentQuoteIndex = -1;

  if (generateBtn && quoteText && quoteAuthor) {
    generateBtn.addEventListener('click', () => {
      // Avoid choosing the exact same quote twice in a row
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * excuseQuotes.length);
      } while (randomIndex === currentQuoteIndex);
      
      currentQuoteIndex = randomIndex;
      const selectedQuote = excuseQuotes[randomIndex];

      // Add fade-out class to start the transition
      quoteText.classList.add('fade-out');
      quoteAuthor.style.opacity = '0';

      // Change content and fade back in after the fade-out completes
      setTimeout(() => {
        quoteText.textContent = `"${selectedQuote.text}"`;
        quoteAuthor.textContent = `— ${selectedQuote.author}`;
        
        quoteText.classList.remove('fade-out');
        quoteText.classList.add('fade-in');
        quoteAuthor.style.opacity = '1';
        
        // Remove animation helper classes
        setTimeout(() => {
          quoteText.classList.remove('fade-in');
        }, 300);
      }, 300);
    });
  }


  /* ==========================================================================
     4. Violin Tuner (Web Audio API Synthesizer)
     ========================================================================== */
  let audioCtx = null;
  let activeOscillator = null;
  let activeGainNode = null;
  let noteTimeout = null;

  const pegButtons = document.querySelectorAll('.peg');
  const stopAudioBtn = document.getElementById('stopAudioBtn');
  const activeNoteDisplay = document.getElementById('activeNoteDisplay');
  const stringElements = {
    'G': document.querySelector('.string-g'),
    'D': document.querySelector('.string-d'),
    'A': document.querySelector('.string-a'),
    'E': document.querySelector('.string-e')
  };

  /**
   * Initializes the AudioContext in a user-interaction-safe manner
   */
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  /**
   * Mutes/stops any current playing synthesizer tone and resets visual states
   */
  function stopAudio() {
    // Clear auto-stop timers
    if (noteTimeout) {
      clearTimeout(noteTimeout);
      noteTimeout = null;
    }

    // Gracefully fade out active notes if playing
    if (activeOscillator && activeGainNode) {
      try {
        const fadeTime = 0.15;
        activeGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        activeGainNode.gain.setValueAtTime(activeGainNode.gain.value, audioCtx.currentTime);
        activeGainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + fadeTime);
        
        const oscToStop = activeOscillator;
        setTimeout(() => {
          try { oscToStop.stop(); } catch(e) {}
        }, fadeTime * 1000);
      } catch (e) {
        // Fallback hard stop if audio context was closed/suspended
        try { activeOscillator.stop(); } catch(err) {}
      }
      activeOscillator = null;
      activeGainNode = null;
    }

    // Reset visual playing states
    pegButtons.forEach(peg => peg.classList.remove('active'));
    Object.values(stringElements).forEach(str => {
      if (str) str.classList.remove('playing');
    });

    if (activeNoteDisplay) activeNoteDisplay.textContent = '—';
    if (stopAudioBtn) stopAudioBtn.disabled = true;
  }

  /**
   * Plays a synthesized violin string tone
   * @param {number} freq - Pitch frequency in Hz
   * @param {string} note - String name (G, D, A, E)
   */
  function playNote(freq, note) {
    initAudio();
    stopAudio(); // Stop previous note before playing a new one

    // Create oscillator and gain nodes
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Use Triangle wave for a smoother, warmer acoustic string-like tone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Dynamic Volume Envelope: Quick attack, slight decay, slow natural fade
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.05); // Attack
    gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 3.5); // Natural Decay

    // Hook nodes up to output destination
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();

    // Save references to manage cancellation later
    activeOscillator = osc;
    activeGainNode = gainNode;

    // Visual updates
    const activePeg = Array.from(pegButtons).find(peg => peg.dataset.note === note);
    if (activePeg) {
      activePeg.classList.add('active');
    }

    const correspondingString = stringElements[note];
    if (correspondingString) {
      correspondingString.classList.add('playing');
    }

    if (activeNoteDisplay) {
      activeNoteDisplay.textContent = `${note} (${freq} Hz)`;
    }

    if (stopAudioBtn) {
      stopAudioBtn.disabled = false;
    }

    // Auto-stop node after 4 seconds (matching envelope decay duration)
    noteTimeout = setTimeout(() => {
      stopAudio();
    }, 4000);
  }

  // Bind click event listeners to tuning pegs
  pegButtons.forEach(peg => {
    const pegBtn = peg.querySelector('.peg-button');
    const note = peg.dataset.note;
    const freq = parseFloat(peg.dataset.freq);

    if (pegBtn && note && freq) {
      pegBtn.addEventListener('click', () => {
        // Toggle play/pause behavior if clicking the already active note
        if (peg.classList.contains('active')) {
          stopAudio();
        } else {
          playNote(freq, note);
        }
      });
    }
  });

  // Mute button handler
  if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', stopAudio);
  }

  // Stop tuner audio if user scrolls away or leaves page to avoid background noise
  window.addEventListener('blur', stopAudio);

});
