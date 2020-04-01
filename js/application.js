animationDelay = 150;
algorithmChoice = null;

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(() => {
  window.manager = new GameManager(4, KeyboardInputManager, HTMLActuator);
});
