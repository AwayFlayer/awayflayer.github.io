/*
 * File Name: chartInteraction.js
 * Copyright (c) 2025 AwayFlayer
 * License: MIT
 */

/**
 * Initialize zoom and pan functionality for charts
 * @param {HTMLCanvasElement} canvas - Canvas element to add interactions to
 * @param {Function} renderCallback - Function to call to re-render chart with updated view
 * @param {Object} options - Configuration options
 */
export const initChartInteractions = (canvas, renderCallback, options = {}) => {
    const state = {
        isDragging: false,
        lastX: 0,
        lastY: 0,
        zoomLevel: 1,
        offsetX: 0,
        offsetY: 0,
        minZoom: options.minZoom ?? 0.5,
        maxZoom: options.maxZoom ?? 5,
        chartType: options.chartType ?? 'bar'  // 'pie' or 'bar'
    };
    
    // Function to handle wheel events for zooming
    function handleWheel(e) {
        e.preventDefault(); // Needed to stop page scrolling, this is why we can't use passive: true
        
        // Calculate zoom factor based on wheel delta
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        
        // Apply zoom limits
        const newZoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.zoomLevel * zoomFactor));
        if (newZoom === state.zoomLevel) return;
        
        // Calculate the point to zoom toward (mouse position)
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Adjust offset to zoom toward mouse position
        state.offsetX = mouseX - (mouseX - state.offsetX) * (newZoom / state.zoomLevel);
        state.offsetY = mouseY - (mouseY - state.offsetY) * (newZoom / state.zoomLevel);
        
        // Update zoom level
        state.zoomLevel = newZoom;
        
        // Re-render the chart with the SAME chart type
        renderCallback({...state, preserveChartType: true});
    }

    function handleMouseDown(e) {
        state.isDragging = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        if (!state.isDragging) return;
        
        // Calculate the distance moved
        const deltaX = e.clientX - state.lastX;
        const deltaY = e.clientY - state.lastY;
        
        // Update last position
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        
        // Update offset
        state.offsetX += deltaX;
        state.offsetY += deltaY;
        
        // Re-render the chart with the SAME chart type
        renderCallback({...state, preserveChartType: true});
    }

    function handleMouseUp() {
        if (!state.isDragging) return;
        state.isDragging = false;
        canvas.style.cursor = 'grab';
    }

    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            // Single touch for panning
            state.isDragging = true;
            state.lastX = e.touches[0].clientX;
            state.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Double touch for pinch zoom
            state.isPinching = true;
            state.initialPinchDistance = getPinchDistance(e);
            state.initialZoom = state.zoomLevel;
        }
    }

    function handleTouchMove(e) {
        if (state.isDragging && e.touches.length === 1) {
            // Single touch panning
            e.preventDefault(); // Prevent scrolling when panning
            const deltaX = e.touches[0].clientX - state.lastX;
            const deltaY = e.touches[0].clientY - state.lastY;
            
            state.lastX = e.touches[0].clientX;
            state.lastY = e.touches[0].clientY;
            
            state.offsetX += deltaX;
            state.offsetY += deltaY;
            
            renderCallback({...state, preserveChartType: true});
        } else if (state.isPinching && e.touches.length === 2) {
            // Pinch zooming
            e.preventDefault(); // Prevent zooming the page
            const currentDistance = getPinchDistance(e);
            const pinchRatio = currentDistance / state.initialPinchDistance;
            
            // Calculate center of pinch
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            const rect = canvas.getBoundingClientRect();
            const pinchCenterX = centerX - rect.left;
            const pinchCenterY = centerY - rect.top;
            
            // Apply zoom limits
            const newZoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.initialZoom * pinchRatio));
            
            // Adjust offset to zoom toward pinch center
            const zoomFactor = newZoom / state.zoomLevel;
            state.offsetX = pinchCenterX - (pinchCenterX - state.offsetX) * zoomFactor;
            state.offsetY = pinchCenterY - (pinchCenterY - state.offsetY) * zoomFactor;
            
            state.zoomLevel = newZoom;
            renderCallback({...state, preserveChartType: true});
        }
    }

    function handleTouchEnd() {
        state.isDragging = false;
        state.isPinching = false;
    }

    function getPinchDistance(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }

    function resetZoom(e) {
        e.preventDefault();
        state.zoomLevel = 1;
        state.offsetX = 0;
        state.offsetY = 0;
        renderCallback({...state, preserveChartType: true});
    }
    
    // Add zoom controls to the chart container
    addZoomControls(canvas.parentElement, state, renderCallback);
    
    // Mouse events for zooming and panning - use passive for better performance
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // Touch events for mobile devices - use passive for better performance where possible
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Double-click to reset zoom
    canvas.addEventListener('dblclick', resetZoom);

    // Return the state and methods for external control
    return {
        getState: () => ({ ...state }),
        reset: resetZoom,
        setOptions: (newOptions) => {
            Object.assign(state, newOptions);
            renderCallback({...state, preserveChartType: true});
        },
        setChartType: (type) => {
            state.chartType = type;
        }
    };
};

/**
 * Add zoom controls to chart container
 * @param {HTMLElement} container - Container element for the chart
 * @param {Object} state - Current zoom/pan state
 * @param {Function} renderCallback - Function to call to re-render chart
 */
const addZoomControls = (container, state, renderCallback) => {
    const existingControls = document.getElementsByClassName('chart-zoom-controls');
    Array.from(existingControls).forEach(control => control.remove());

    // Create zoom controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('chart-zoom-controls');
    
    // Create zoom in button
    const zoomInButton = document.createElement('button');
    zoomInButton.type = "button";
    zoomInButton.classList.add('zoom-btn');
    zoomInButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
        </svg>
    `;
    zoomInButton.title = "Zoom in";
    
    // Create zoom out button
    const zoomOutButton = document.createElement('button');
    zoomOutButton.type = "button";
    zoomOutButton.classList.add('zoom-btn');
    zoomOutButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13H5v-2h14v2z"></path>
        </svg>
    `;
    zoomOutButton.title = "Zoom out";
    
    // Create reset button
    const resetButton = document.createElement('button');
    resetButton.type = "button";
    resetButton.classList.add('zoom-btn');
    resetButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path>
        </svg>
    `;
    resetButton.title = "Reset view";
    
    // Add event listeners
    zoomInButton.addEventListener('click', () => {
        state.zoomLevel = Math.min(state.maxZoom, state.zoomLevel * 1.2);
        renderCallback({...state, preserveChartType: true});
    });
    
    zoomOutButton.addEventListener('click', () => {
        state.zoomLevel = Math.max(state.minZoom, state.zoomLevel / 1.2);
        renderCallback({...state, preserveChartType: true});
    });
    
    resetButton.addEventListener('click', () => {
        state.zoomLevel = 1;
        state.offsetX = 0;
        state.offsetY = 0;
        renderCallback({...state, preserveChartType: true});
    });
    
    // Append buttons to controls container
    controlsContainer.appendChild(zoomInButton);
    controlsContainer.appendChild(zoomOutButton);
    controlsContainer.appendChild(resetButton);
    
    // Append controls to the chart container
    container.appendChild(controlsContainer);
};

/**
 * Apply transformations to canvas based on zoom state
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} state - Current zoom/pan state
 */
export const applyViewTransformation = (ctx, state) => {
    const { zoomLevel, offsetX, offsetY } = state;
    
    // Save the current context state
    ctx.save();
    
    // Apply transformations: first translate, then scale
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoomLevel, zoomLevel);
    
    return () => {
        // Return a function to restore the context
        ctx.restore();
    };
};