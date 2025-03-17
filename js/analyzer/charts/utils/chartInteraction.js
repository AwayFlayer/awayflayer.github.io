/* Copyright (c) 2025 AwayFlayer ** License: MIT */

/**
 * Initialize zoom and pan functionality for charts
 * @param {HTMLCanvasElement} canvas - Canvas element to add interactions to
 * @param {Function} renderCallback - Function to call to re-render chart with updated view
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.minZoom=0.5] - Minimum zoom level
 * @param {number} [options.maxZoom=5] - Maximum zoom level
 * @param {string} [options.chartType='bar'] - Type of the chart (e.g., 'bar', 'pie')
 * @returns {Object} - An object with methods to get state, reset zoom, set options, and set chart type
 */
export const initChartInteractions = (canvas, zoomInfo, renderCallback, options = {}) => {
    const state = {
        isDragging: false,
        lastX: 0,
        lastY: 0,
        zoomLevel: 1,
        offsetX: 0,
        offsetY: 0,
        minZoom: options.minZoom ?? 0.5,
        maxZoom: options.maxZoom ?? 5,
        chartType: options.chartType ?? 'bar',
        isPinching: false,
        initialPinchDistance: 0,
        initialZoom: 1
    };

    const handleWheel = (e) => {
        e.preventDefault();

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.zoomLevel * zoomFactor));
        if (newZoom === state.zoomLevel) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        state.offsetX = mouseX - (mouseX - state.offsetX) * (newZoom / state.zoomLevel);
        state.offsetY = mouseY - (mouseY - state.offsetY) * (newZoom / state.zoomLevel);
        state.zoomLevel = newZoom;

        renderCallback({...state, preserveChartType: true});
    };

    const handleMouseDown = (e) => {
        state.isDragging = true;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!state.isDragging) return;

        const deltaX = e.clientX - state.lastX;
        const deltaY = e.clientY - state.lastY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.offsetX += deltaX;
        state.offsetY += deltaY;

        renderCallback({...state, preserveChartType: true});
    };

    const handleMouseUp = () => {
        if (!state.isDragging) return;
        state.isDragging = false;
        canvas.style.cursor = 'grab';
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            state.isDragging = true;
            state.lastX = e.touches[0].clientX;
            state.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            state.isPinching = true;
            state.initialPinchDistance = getPinchDistance(e);
            state.initialZoom = state.zoomLevel;
        }
    };

    const handleTouchMove = (e) => {
        if (state.isDragging && e.touches.length === 1) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - state.lastX;
            const deltaY = e.touches[0].clientY - state.lastY;

            state.lastX = e.touches[0].clientX;
            state.lastY = e.touches[0].clientY;

            state.offsetX += deltaX;
            state.offsetY += deltaY;

            renderCallback({...state, preserveChartType: true});
        } else if (state.isPinching && e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getPinchDistance(e);
            const pinchRatio = currentDistance / state.initialPinchDistance;

            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            const rect = canvas.getBoundingClientRect();
            const pinchCenterX = centerX - rect.left;
            const pinchCenterY = centerY - rect.top;
            const newZoom = Math.max(state.minZoom, Math.min(state.maxZoom, state.initialZoom * pinchRatio));
            const zoomFactor = newZoom / state.zoomLevel;
            state.offsetX = pinchCenterX - (pinchCenterX - state.offsetX) * zoomFactor;
            state.offsetY = pinchCenterY - (pinchCenterY - state.offsetY) * zoomFactor;

            state.zoomLevel = newZoom;
            renderCallback({...state, preserveChartType: true});
        }
    };

    const handleTouchEnd = () => {
        state.isDragging = false;
        state.isPinching = false;
    };

    const getPinchDistance = (e) => {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    const resetZoom = (e) => {
        e.preventDefault();
        state.zoomLevel = 1;
        state.offsetX = 0;
        state.offsetY = 0;
        renderCallback({...state, preserveChartType: true});
        zoomInfo.textContent = "Scroll to zoom, drag to pan, double-click to reset view";
    };

    addZoomControls(canvas.parentElement, state, renderCallback);

    canvas.addEventListener('wheel', handleWheel, {passive: false});
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, {passive: true});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd, {passive: true});
    canvas.addEventListener('dblclick', resetZoom);

    return {
        getState: () => ({...state}),
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
 * Create a zoom control button
 * @param {string} type - Type of the button ('zoomIn', 'zoomOut', 'reset')
 * @param {string} svgPath - SVG path for the button icon
 * @param {string} title - Title for the button
 * @param {Function} onClick - Click event handler for the button
 * @returns {HTMLButtonElement} - Created button element
 */
const createZoomControlButton = (svgPath, title, onClick) => {
    const button = document.createElement('button');
    button.type = "button";
    button.classList.add('zoom-btn');
    button.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="${svgPath}"></path></svg>`;
    button.title = title;
    button.addEventListener('click', onClick);
    return button;
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
    
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('chart-zoom-controls');

    const zoomInButton = createZoomControlButton(
        "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
        "Zoom in",
        () => {
            state.zoomLevel = Math.min(state.maxZoom, state.zoomLevel * 1.2);
            renderCallback({...state, preserveChartType: true});
        }
    );

    const zoomOutButton = createZoomControlButton(
        "M19 13H5v-2h14v2z",
        "Zoom out",
        () => {
            state.zoomLevel = Math.max(state.minZoom, state.zoomLevel / 1.2);
            renderCallback({...state, preserveChartType: true});
        }
    );

    const resetButton = createZoomControlButton(
        "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
        "Reset view",
        () => {
            state.zoomLevel = 1;
            state.offsetX = 0;
            state.offsetY = 0;
            renderCallback({...state, preserveChartType: true});
        }
    );

    controlsContainer.appendChild(zoomInButton);
    controlsContainer.appendChild(zoomOutButton);
    controlsContainer.appendChild(resetButton);

    container.appendChild(controlsContainer);
};

export {addZoomControls};

/**
 * Apply transformations to canvas based on zoom state
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @param {Object} state - Current zoom/pan state
 * @returns {Function} - Function to restore the context
 */
export const applyViewTransformation = (ctx, state) => {
    const {zoomLevel, offsetX, offsetY} = state;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoomLevel, zoomLevel);

    return () => {
        ctx.restore();
    };
};