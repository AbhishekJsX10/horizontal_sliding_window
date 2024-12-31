document.addEventListener("DOMContentLoaded",()=>{
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
        duration: 1.2,
        smoothWheel: true
    })
    
    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add((time)=>{
        lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    const stickySection = document.querySelector(".steps")
    const stickyHeight = window.innerHeight * 8
    const cards = gsap.utils.toArray(".card:not(.empty)")
    const emptyCards = gsap.utils.toArray(".card.empty")
    const countContainer = document.querySelector(".count-container")
    const countElements = countContainer.querySelectorAll("h1")

    const totalCards = cards.length
    let currentCounterIndex = 0
    let isCounterAnimating = false

    const mainTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: stickySection,
            start: "top top",
            end: `+=${stickyHeight}px`,
            pin: true,
            scrub: 0.5,
            onUpdate: (self) => {
                const progress = self.progress
                positionCards(progress)
            }
        }
    })

    const getRadius = () => {
        return window.innerWidth < 900 
            ? window.innerWidth * 7.5 
            : window.innerWidth * 2.5
    }

    const arcAngle = Math.PI * 0.6
    const startAngle = Math.PI / 2 - arcAngle / 2

    function updateCounterSequentially(targetIndex) {
        if (isCounterAnimating || currentCounterIndex === targetIndex) return

        isCounterAnimating = true
        const timeline = gsap.timeline({
            onComplete: () => {
                isCounterAnimating = false
                currentCounterIndex = targetIndex
            }
        })

        // If going to invisible state (index 0)
        if (targetIndex === 0) {
            timeline.to(countContainer, {
                y: 0,
                duration: 0.15,
                ease: "power2.inOut"
            })
            return
        }

        const direction = targetIndex > currentCounterIndex ? 1 : -1
        const steps = Math.abs(targetIndex - currentCounterIndex)
        
        for (let i = 0; i < steps; i++) {
            const nextIndex = currentCounterIndex + ((i + 1) * direction)
            timeline.to(countContainer, {
                y: -(nextIndex * 150),
                duration: 0.15,
                ease: "power2.inOut"
            })
        }
    }

    function positionCards(progress = 0) {
        const radius = getRadius()
        const totalTravel = 1.5 + totalCards / 7
        const adjustedProgress = (progress * totalTravel - 1) * 0.75

        let activeCardIndex = -1
        let shouldShowCounter = false

        cards.forEach((card, i) => {
            const normalizedProgress = (totalCards - i - 1) / totalCards
            const cardProgress = normalizedProgress + adjustedProgress
            const angle = startAngle + arcAngle * cardProgress

            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            const rotation = (angle - Math.PI/2) * (180 / Math.PI)
            
            const extraX = cardProgress > 1 ? (cardProgress - 1) * window.innerWidth : 0

            // Check if any card is in the active zone
            if (Math.abs(x) < radius * 0.3 && y > 0) {
                activeCardIndex = i
                shouldShowCounter = true
            }

            gsap.set(card, {
                x: x + extraX,
                y: -y + radius,
                rotation: -rotation,
                transformOrigin: "center center",
                opacity: cardProgress > 1.2 ? 0 : 1
            })
        })

        emptyCards.forEach((card) => {
            gsap.set(card, {
                x: window.innerWidth * 1.5,
                y: radius,
                opacity: 0
            })
        })

        // Update counter based on active card or set to invisible state
        if (shouldShowCounter && activeCardIndex !== -1) {
            updateCounterSequentially(activeCardIndex + 1)
        } else {
            updateCounterSequentially(0) // Go to invisible state
        }
    }

    // Initialize positions
    positionCards(0)
    gsap.set(countContainer, { y: 0 })

    // Handle resize
    window.addEventListener("resize", () => {
        positionCards(0)
    })
})