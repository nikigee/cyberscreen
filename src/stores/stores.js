import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

export const useLootStore = defineStore('loot', () => {
  const arr = ref([]);

  const lootableGearList = [
    { name: "Pants", cost: 20 },
    { name: "Top", cost: 20 },
    { name: "Jacket", cost: 35 },
    { name: "Footwear", cost: 25 },
    { name: "Jewelry", cost: "10-100" },
    { name: "Mirrored Shades", cost: 5 },
    { name: "Contact Lenses", cost: 10 },
    { name: "Glasses", cost: 50 },
    { name: "Techscanner", cost: 600 },
    { name: "Cutting Torch", cost: 40 },
    { name: "Tech Toolkit", cost: 100 },
    { name: "B & E Tools", cost: 120 },
    { name: "Electronics Toolkit", cost: 100 },
    { name: "Protective Goggles", cost: 20 },
    { name: "Flashtube", cost: 2 },
    { name: "Glowstick", cost: 1 },
    { name: "Flash Paint", cost: "10 per pt" },
    { name: "Flash Tape", cost: "10 per foot" },
    { name: "Rope", cost: "2 per foot" },
    { name: "Breathing Mask", cost: 30 },
    { name: "Holo Generator", cost: 500 },
    { name: "Video Board", cost: "100 per sq ft" },
    { name: "Data Chip", cost: 10 },
    { name: "Logcompass", cost: 50 },
    { name: "Digital Recorder", cost: 300 },
    { name: "Digital Camera", cost: 150 },
    { name: "VideoCam", cost: 800 },
    { name: "Pocket TV", cost: 80 },
    { name: "Digital Chip Player", cost: 150 },
    { name: "Digital Music Chip", cost: 200 },
    { name: "Electric Guitar", cost: "100-500" },
    { name: "Electronic Keyboard", cost: "20-300" },
    { name: "Drum Synthesizer", cost: "200-800" },
    { name: "Amplifier", cost: "500-1000" },
    { name: "Pocket Computer", cost: 100 },
    { name: "Interface Cables", cost: "20-30" },
    { name: "Low Impedance Cables", cost: 60 },
    { name: "'Trode Set", cost: 20 },
    { name: "Keyboard", cost: "100-600" },
    { name: "Terminal", cost: 400 },
    { name: "Mastoid Commo", cost: 100 },
    { name: "Pocket Commo", cost: 50 },
    { name: "Cellular Phone", cost: 400 },
    { name: "Mini Cell Phone", cost: 800 },
    { name: "Binglasses", cost: 200 },
    { name: "Binoculars", cost: 200 },
    { name: "Light Booster Goggles", cost: 200 },
    { name: "IR Goggles", cost: 250 },
    { name: "IR Flash", cost: 50 },
    { name: "Well Drink", cost: 20 },
    { name: "Bodyweight", cost: "20.00 per level" },
    { name: "Line Tap", cost: 200 },
    { name: "Code Decryptor", cost: 500 },
    { name: "VocDecryptor", cost: 1000 },
    { name: "Security Scanner", cost: 1500 },
    { name: "Poison Sniffer", cost: 1500 },
    { name: "Jamming Transmitter", cost: 500 },
    { name: "Scanner Plate", cost: 40 },
    { name: "Movement Sensor", cost: 40 },
    { name: "Password Terminal", cost: 80 },
    { name: "Tracking Device", cost: 1000 },
    { name: "Tracer Button", cost: 20 },
    { name: "Remote Sensors", cost: 700 },
    { name: "PlasKuffs", cost: 50 },
    { name: "Stripwire Binders", cost: 50 },
    { name: "Dermal Stapler", cost: 1000 },
    { name: "Spray Skin", cost: "50 per oz" },
    { name: "Slap Patch", cost: "Varies by drug type" },
    { name: "First Aid Kit", cost: 50 },
    { name: "Medscanner", cost: 30 },
    { name: "Drug Analyser", cost: 75 },
    { name: "Airhypo", cost: 200 },
    { name: "Nylon Carrybag", cost: 5 },
    { name: "Sleeping Bag", cost: 25 },
    { name: "Inflatable Bed", cost: 50 },
    { name: "Lamp", cost: 20 },
    { name: "Cleaning Bot", cost: 1000 },
    { name: "Kibble", cost: "50 per week" },
    { name: "Generic Prepack", cost: "150 per week" },
    { name: "Good Prepack", cost: "200 per week" },
    { name: "Fresh Food", cost: "300 per week" },
    { name: "Healing Stimpack", cost: 50 },
    { name: "Greater Stimpack", cost: 250 },
    { name: "Superior Stimpack", cost: 2500 },
    { name: "Supreme Stimpack", cost: 20000 },
    { name: "Drug of Haste", cost: 1000 }
  ];

  return { arr, lootableGearList }
})