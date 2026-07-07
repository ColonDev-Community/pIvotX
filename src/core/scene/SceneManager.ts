// ─── Scenes ───────────────────────────────────────────────────────────────────
//
// Minimal scene/state management: menu → game → pause without if-chains.
//
//   class MenuScene extends Scene {
//     update(dt) { if (Keyboard.justPressed('enter')) this.manager.switch(new GameScene()); }
//     draw(ctx)  { ...title screen... }
//   }
//
//   const scenes = new SceneManager(new MenuScene());
//   canvas.startLoop((dt) => {
//     canvas.clear();
//     scenes.update(dt);
//     scenes.draw(canvas.ctx);
//   });
//
// push()/pop() give you overlay scenes (e.g. pause menu over a frozen game):
// only the top scene updates, but every scene in the stack draws (bottom-up).
//

/** Base class for game scenes. Override the lifecycle methods you need. */
export abstract class Scene {
  /** Set by SceneManager when the scene becomes managed. */
  public manager!: SceneManager;

  /** Called when the scene becomes active (switched or pushed to). */
  enter(): void { /* override */ }

  /** Called when the scene stops being active (switched away or popped). */
  exit(): void { /* override */ }

  /** Called every frame while this scene is on top of the stack. */
  update(_dt: number): void { /* override */ }

  /** Called every frame for every scene in the stack (bottom-up). */
  abstract draw(ctx: CanvasRenderingContext2D): void;
}

export class SceneManager {
  private _stack: Scene[] = [];

  constructor(initial?: Scene) {
    if (initial) this.switch(initial);
  }

  /** The active (top-of-stack) scene, or null. */
  get current(): Scene | null {
    return this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;
  }

  /** Number of scenes on the stack. */
  get depth(): number { return this._stack.length; }

  /** Replace the whole stack with a single new scene. */
  switch(scene: Scene): void {
    while (this._stack.length > 0) {
      this._stack.pop()!.exit();
    }
    scene.manager = this;
    this._stack.push(scene);
    scene.enter();
  }

  /** Push an overlay scene (e.g. pause menu). The scene below keeps drawing. */
  push(scene: Scene): void {
    scene.manager = this;
    this._stack.push(scene);
    scene.enter();
  }

  /** Pop the top scene, returning to the one below. */
  pop(): void {
    const top = this._stack.pop();
    top?.exit();
  }

  /** Update the active scene. Call once per frame. */
  update(dt: number): void {
    this.current?.update(dt);
  }

  /** Draw every scene in the stack, bottom-up. Call once per frame. */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const scene of this._stack) scene.draw(ctx);
  }
}
