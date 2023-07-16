type EasingOptions = {
  ease?: string;
  delay?: number;
};

type EasingOptionsWithTarget = EasingOptions & {
  target: Vector2;
};

type ExtendedEasingOptions = EasingOptions & {
  duration?: number;
  offset?: number;
  towardsCenter?: boolean;
};

type Vector2 = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type Shapes = "polygon" | "rectangle" | "circle" | "ellipse" | "roundedRect";

type VisibleFoundryTypes =
  | Token
  | TokenDocument
  | Tile
  | TileDocument
  | Drawing
  | DrawingDocument
  | MeasuredTemplate
  | MeasuredTemplateDocument;

declare class CoreMethods {
  /**
   * Creates a section that will run a function.
   */
  thenDo(inFunc: () => void | (() => Promise<void>)): Sequence;

  /**
   * Creates a section that will run a macro based on a name, id, UUID, or a direct reference to a macro.
   */
  macro(inMacro: string | Macro, ...arguments: any): Sequence;

  /**
   * Causes the sequence to wait after the last section for as many milliseconds as you pass to this method. If given
   * a second number, a random wait time between the two given numbers will be generated. Both parameters default to 1ms.
   */
  wait(delayMs?: number, delayRangeEndMs?: number): Sequence;

  /**
   * Creates an animation. Until you call any other sections you'll be working on the Animation section.
   */
  animation(inTokenOrInTile?: VisibleFoundryTypes): AnimationSection;

  /**
   * Creates an effect section. Until you call any other sections you'll be working on the Effect section.
   */
  effect(filePath?: string): EffectSection;

  /**
   * Creates a sound section. Until you call any other sections you'll be working on the Sound section.
   */
  sound(filePath?: string): SoundSection;

  /**
   * Creates a scrolling text. Until you call any other sections you'll be working on the Scrolling Text section.
   */
  scrollingText(
    inTarget?: VisibleFoundryTypes | Vector2,
    inText?: string,
    inTextStyle?: object
  ): ScrollingTextSection;

  /**
   * Pans the canvas text. Until you call any other sections you'll be working on the Canvas Pan section.
   */
  canvasPan(
    inTarget?: VisibleFoundryTypes | Vector2,
    inDuration?: number,
    inSpeed?: number
  ): CanvasPanSection;

  /**
   * Adds the sections from a given Sequence to this Sequence
   */
  addSequence(
    inSequence: Sequence | EffectSection | AnimationSection | SoundSection
  ): Sequence;

  /**
   * Appends a preset to the current sequence in place
   */
  preset(
    presetName: string,
    args?: any
  ): Sequence | EffectSection | AnimationSection | SoundSection;

  /**
   * Plays all of this sequence's sections, resolves to the sequence instance
   */
  play(inOptions?: { remote?: boolean }): Promise<Sequence>;

  /**
   * Turns the sequence into an array of objects to be reconstructed later
   */
  toJSON(): Array<Object>;

  /**
   * Takes the serialized sequence array and returns a sequence ready to be played
   */
  fromJSON(inJSON: Array<Object>): Sequence;
}

declare interface Sequence extends CoreMethods {}

declare class Sequence {
  /**
   * Declaring the module name when using new Sequence() will make every error or warning caught during the runtime also
   * include the module name, which lets you and other users know which module caused the error. The secondary argument
   * is an object that can contain a number of optional arguments.
   */
  constructor(inOptions?: { inModuleName?: string; softFail?: boolean });
}

declare abstract class Section<T> {
  readonly shouldWaitUntilFinished: boolean;
  readonly shouldAsync: boolean;
  readonly shouldPlay: boolean;

  /**
   * Causes the section to finish running before starting the next section.
   */
  waitUntilFinished(minDelay?: number, maxDelay?: number): T;

  /**
   * Causes each effect or sound to finish playing before the next one starts playing. This differs from
   * .waitUntilFinished() in the sense that this is for each repetition, whilst .waitUntilFinished() is
   * for the entire section.
   */
  async(): T;

  /**
   * Causes the effect or sound to be repeated n amount of times, with an optional delay. If given inRepeatDelayMin
   * and inRepeatDelayMax, a random repetition delay will be picked for every repetition
   */
  repeats(
    inRepetitions: number,
    inRepeatDelayMin?: number,
    inRepeatDelayMax?: number
  ): T;

  /**
   * Causes the effect or sound to not play, and skip all delays, repetitions, waits, etc. If you pass a function,
   * the function should return something false-y if you do not want the effect or sound to play.
   */
  playIf(condition: boolean | (() => boolean)): T;

  /**
   * Delays the effect or sound from being played for a set amount of milliseconds. If given a second number, a
   * random delay between the two numbers will be generated.
   */
  delay(msMin: number, msMax?: number): T;

  /**
   * Overrides the duration of this section
   */
  duration(inDuration: number): T;

  /**
   * Appends a preset to the current sequence in place
   */
  preset(presetName: string, args?: any): T;
}

declare abstract class HasAudio<T> {
  /**
   * Sets the volume of the sound.
   */
  volume(inVolume: number): T;

  /**
   * Causes the animated section to fade in its audio (if any) when played
   */
  fadeInAudio(duration: number, options?: EasingOptions): T;

  /**
   * Causes the audio to fade out at the end of the animated section's duration
   */
  fadeOutAudio(duration: number, options?: EasingOptions): T;
}

declare abstract class HasFiles<T> {
  /**
   * Declares which file to be played. This may also be an array of paths, which will be randomly picked from each
   * time the section is played.
   */
  file(inFile: string | string[]): T;

  /**
   * Defines the base folder that will prepend to the file path. This is mainly just useful to make the file
   * path easier to manage.
   */
  baseFolder(inBaseFolder: string): T;

  /**
   * Sets the Mustache of the filepath. This is applied after the randomization of the filepath, if available.
   */
  setMustache(inMustache: Record<string, unknown>): T;
}

declare abstract class HasMovement<T> {
  /**
   * Sets the rotation of the effect or animation, which is added on top of the calculated rotation after .rotateTowards() or .randomRotation()
   */
  moveTowards(
    inTarget: VisibleFoundryTypes | Vector2 | string,
    options?: EasingOptionsWithTarget
  ): this;

  /**
   Sets the speed (pixels per frame) to move the target object
   */
  moveSpeed(inSpeed: number): T;
}

declare abstract class HasOpacity<T> {
  /**
   * Sets the opacity of the effect. If used with .fadeIn() and/or .fadeOut(), this defines what the effect will fade to/from
   */
  opacity(inOpacity: number): T;

  /**
   * Causes the effect to fade in when played
   */
  fadeIn(durationMs: number, options?: EasingOptions): T;

  /**
   * Causes the effect to fade out at the end of the effect's duration
   */
  fadeOut(durationMs: number, options?: EasingOptions): T;
}

declare abstract class HasRotation<T> {
  /**
   * The object gets a random rotation, which means it should not be used with .stretchTo()
   */
  randomRotation(inBool?: boolean): T;

  /**
   * Sets the rotation of the effect or animation, which is added on top of the calculated rotation after .rotateTowards() or .randomRotation()
   */
  rotate(inRotation: number): T;

  /**
   *  Causes the effect to rotate when it starts playing
   */
  rotateIn(degrees: number, duration: number, options?: EasingOptions): T;

  /**
   *  Causes the effect to rotate at the end of the effect's duration
   */
  rotateOut(degrees: number, duration: number, options?: EasingOptions): T;
}

declare abstract class HasScale<T> {
  /**
   * A method that can take the following:
   *  - A number to set the scale uniformly
   *  - An object with x and y for non-uniform scaling
   *  - Two numbers which the TokenFactions will randomly pick a uniform scale between
   */
  scale(inScaleMin: number, inScaleMax?: number): T;

  /**
   * Causes the effect to scale when it starts playing
   */
  scaleIn(inScale: number, durationMs: number, options?: EasingOptions): T;

  /**
   * Causes the effect to scale at the end of the effect's duration
   */
  scaleOut(inScale: number, durationMs: number, options?: EasingOptions): T;
}

declare abstract class HasTime<T> {
  /**
   * Sets the start and end time of the section, playing only that range
   */
  timeRange(inMsStart: number, inMsEnd: number): T;

  /**
   * Sets the start time of the section.
   */
  startTime(inMs: number): T;

  /**
   * Sets the start time of the section based on a percentage from its total duration.
   */
  startTimePerc(inPercentage: number): T;

  /**
   * Sets the ending time of the section (from the end).
   */
  endTime(inMs: number): T;

  /**
   * Sets the ending time of the section based on a percentage from the total duration.
   */
  endTimePerc(inPercentage: number): T;
}

declare abstract class HasTint<T> {
  /**
   * Tints the target of this section by the color given to the
   */
  tint(inColor: number | string): T;
}

declare abstract class HasUsers<T> {
  /**
   * Causes section to be executed only locally, and not push to other connected clients.
   */
  locally(inLocally?: boolean): T;

  /**
   * Causes the section to be executed for only a set of users.
   */
  forUsers(inUsers: string | User | Array<string | User>): T;
}

declare abstract class HasAnimations<T> {
  /**
   * Animates a property on the target of the animation.
   */
  animateProperty(
    inTarget: string,
    inPropertyName: string,
    inOptions: {
      duration: number;
      from: number;
      to: number;
      delay?: number;
      ease?: string;
      fromEnd?: boolean;
      gridUnits?: boolean;
    }
  ): this;

  /**
   * Loops a property between a set of values on the target
   */
  loopProperty(
    inTarget: string,
    inPropertyName: string,
    inOptions: {
      duration: number;
      from?: number;
      to?: number;
      values?: Array<number>;
      loops?: number;
      pingPong?: boolean;
      delay?: number;
      ease?: string;
      fromEnd?: boolean;
      gridUnits?: boolean;
    }
  ): this;
}

declare abstract class HasFilters<T> {
  /**
   * Applies a files
   */
  filter(inFilterName: string, inData?: {}, inName?: string): this;
}

declare abstract class HasLocation<T> {
  /**
   *  A smart method that can take a reference to an object, or a direct on the canvas to play the effect at,
   *  or a string reference (see .name())
   */
  atLocation(
    inLocation: VisibleFoundryTypes | Vector2 | string,
    inOptions?: {
      cacheLocation?: boolean;
      offset?: Vector2;
      randomOffset?: number;
      gridUnits?: boolean;
      local?: boolean;
    }
  ): this;
}

declare abstract class HasText<T> {
  /**
   * Creates a text element, attached to the sprite. The options for the text are available here:
   * https://pixijs.io/pixi-text-style/
   */
  text(inText: string, inOptions?: object): this;
}

interface AnimatedSection<T> {}

declare interface AnimationSection
  extends CoreMethods,
    Section<AnimationSection>,
    HasMovement<AnimationSection>,
    HasOpacity<AnimationSection>,
    HasRotation<AnimationSection>,
    HasAudio<AnimationSection>,
    HasTint<AnimationSection>,
    AnimatedSection<AnimationSection> {}

declare abstract class AnimationSection {
  /**
   * Sets the target object to be animated
   */
  on(inTarget: VisibleFoundryTypes | string): this;

  /**
   * Sets the location to teleport the target object to
   */
  teleportTo(
    inTarget: VisibleFoundryTypes | Vector2 | string,
    options?: { delay: number; relativeToCenter: boolean }
  ): this;

  /**
   * Sets the location to rotate the object to
   */
  rotateTowards(
    inTarget: VisibleFoundryTypes | Vector2 | string,
    options?: {
      duration: Number;
      ease: string;
      delay: number;
      rotationOffset: number;
      towardsCenter: boolean;
      cacheLocation: boolean;
    }
  ): this;

  /**
   * Causes the movement or teleportation to be offset in the X and/or Y axis
   */
  offset(inOffset: Vector2): this;

  /**
   * Causes the movement or teleportation to pick the closest non-intersecting square, if the target is a token or tile
   */
  closestSquare(inBool?: boolean): this;

  /**
   * Causes the final location to be snapped to the grid
   */
  snapToGrid(inBool?: boolean): this;

  /**
   * Causes the object to become hidden
   */
  hide(inBool?: boolean): this;

  /**
   * Causes the object to become visible
   */
  show(inBool?: boolean): this;
}

declare interface EffectSection
  extends CoreMethods,
    Section<EffectSection>,
    HasFiles<EffectSection>,
    HasAudio<EffectSection>,
    HasMovement<EffectSection>,
    HasOpacity<EffectSection>,
    HasRotation<EffectSection>,
    HasScale<EffectSection>,
    HasTime<EffectSection>,
    HasUsers<EffectSection>,
    HasAnimations<EffectSection>,
    HasFilters<EffectSection>,
    HasTint<EffectSection>,
    HasLocation<EffectSection>,
    HasText<EffectSection>,
    AnimatedSection<EffectSection> {}

declare abstract class EffectSection {
  /**
   * Causes the effect's position to be stored and can then be used  with .atLocation(), .stretchTowards(),
   * and .rotateTowards() to refer to previous effects' locations
   */
  name(inName: string): this;

  /**
   * Causes the effect to persist indefinitely on the canvas until _ended via TokenFactionsEffectManager.endAllEffects() or
   * name the effect with .name() and then end it through TokenFactionsEffectManager.endEffect()
   */
  persist(
    inBool?: boolean,
    inOptions?: { persistTokenPrototype: boolean }
  ): this;

  /**
   * Sets the effect's playback rate. A playback rate of 2.0 would make it play 2x as fast, 0.5 would make
   * it play half as fast.
   */
  playbackRate(inNumber: number): this;

  /**
   * Causes the effect to target a location close to the .stretchTowards() location, but not on it.
   */
  missed(inBool?: boolean): this;

  /**
   * Adds a function that will run at the end of the effect serialization step, but before it is played. Allows direct
   * modifications of effect's data. For example, it could be manipulated to change which file will be used based
   * on the distance to the target.
   */
  addOverride(inFunc: Function): this;

  /**
   * A smart method that can take a reference to an object, or a direct on the canvas to attach an effect to,
   * or a string reference (see .name())
   */
  attachTo(
    inLocation: VisibleFoundryTypes | Vector2 | string,
    inOptions?: {
      align?: string;
      edge?: string;
      bindVisibility?: boolean;
      bindAlpha?: boolean;
      bindElevation?: boolean;
      followRotation?: boolean;
      offset?: Vector2;
      randomOffset?: number;
      gridUnits?: boolean;
      local?: boolean;
    }
  ): this;

  /**
   * Causes the effect to be rotated and stretched towards an object, or a direct on the canvas to play the effect at, or a string reference (see .name())
   * This effectively calculates the proper X scale for the effect to reach the target
   */
  stretchTo(
    inLocation: VisibleFoundryTypes | Vector2 | string,
    inOptions?: {
      cacheLocation?: boolean;
      attachTo?: boolean;
      onlyX?: boolean;
      tiling?: boolean;
      offset?: Vector2;
      randomOffset?: number;
      gridUnits?: boolean;
      local?: boolean;
      requiresLineOfSight?: boolean;
      hideLineOfSight?: boolean;
    }
  ): this;

  /**
   * Sets the location to rotate the object to
   */
  rotateTowards(
    inLocation: VisibleFoundryTypes | Vector2 | string,
    inOptions?: {
      rotationOffset?: number;
      cacheLocation?: boolean;
      attachTo?: boolean;
      offset?: Vector2;
      randomOffset?: number;
      gridUnits?: boolean;
      local?: boolean;
    }
  ): this;

  /**
   * Create an effect based on the given object, effectively copying the object as an effect. Useful when you want to do some effect magic on tokens or tiles.
   */
  from(
    inLocation: Token | Tile | TokenDocument | TileDocument,
    inOptions?: {
      cacheLocation?: boolean;
      offset?: Vector2;
      randomOffset?: number;
      gridUnits?: boolean;
      local?: boolean;
    }
  ): this;

  /**
   * Creates a graphical element, attached to the sprite.
   */
  shape(
    inType: Shapes,
    inOptions?: {
      radius?: number;
      width?: number;
      height?: number;
      points?: Array<[number, number] | { x: number; y: number }>;
      gridUnits?: boolean;
      name?: string;
      fillColor?: string | number;
      fillAlpha?: number;
      alpha?: number;
      lineSize?: number;
      lineColor?: string | number;
      offset?: {
        x?: number;
        y?: number;
        gridUnits?: boolean;
      };
      isMask?: boolean;
    }
  );

  /**
   * Causes the effect's sprite to be offset relative to its location based on a given vector
   */
  spriteOffset(
    inOffset: Vector2,
    inOptions?: {
      gridUnits?: boolean;
      local?: boolean;
    }
  ): this;

  /**
   * Causes the final effect location to be snapped to the grid
   */
  snapToGrid(inBool?: boolean): this;

  /**
   * Causes the effect to be scaled to the target object's width
   */
  scaleToObject(
    inScale?: number,
    inOptions?: {
      uniform?: boolean;
      considerTokenScale?: boolean;
    }
  ): this;

  /**
   * Sets the width and the height of the effect in pixels, this size is set before any scaling
   */
  size(
    inSize: Number | Size,
    inOptions?: {
      gridUnits: boolean;
    }
  ): this;

  /**
   * This scales the sprite of the effect, and this method can take the following:
   * - A number to set the scale uniformly
   * - An object with x and y for non-uniform scaling
   * - Two numbers which the TokenFactions will randomly pick a uniform scale between
   */
  spriteScale(inScaleMin: Number | Vector2, inScaleMax?: number): this;

  /**
   * This defines the internal padding of this effect. Gridsize determines the internal grid size of this effect which will determine how big it is on the canvas
   * relative to the canvas's grid size. Start and end point defines padding at the left and right of the effect
   */
  template(inTemplate?: {
    gridSize: number;
    startPoint: number;
    endPoint: number;
  }): this;

  /**
   * This makes the texture of the effect tile, effectively repeat itself within the sprite's dimensions
   */
  tilingTexture(scale?: Vector2, position?: Vector2): this;

  /**
   *  Anchors the sprite's container according to the given x and y coordinates, or uniformly based on a single number
   */
  anchor(inAnchor: Vector2): this;

  /**
   *  Anchors the sprite according to the given x and y coordinates, or uniformly based on a single number
   */
  spriteAnchor(inAnchor: Vector2): this;

  /**
   *  Centers the sprite, effectively giving it an anchor of {x: 0.5, y: 0.5}
   *
   *  Note: If this is used, it will override the anchor set by Aim Towards, which sets the sprite's anchor to the
   *  outermost edge of the location the sprite is played at
   */
  center(): this;

  /**
   * The sprite gets a randomized flipped X scale. If the scale on that axis was 1, it can
   * become 1 or -1, effectively mirroring the sprite on its horizontal axis
   */
  randomizeMirrorX(inBool?: boolean): this;

  /**
   * The sprite gets a randomized flipped Y scale. If the scale on that axis was 1, it can
   * become 1 or -1, effectively mirroring the sprite on its vertical axis
   */
  randomizeMirrorY(inBool?: boolean): this;

  /**
   * The sprite gets a flipped X scale. If the scale on that axis was 1, it will become 1 or -1, effectively
   * mirroring the sprite on its horizontal axis
   */
  mirrorX(inBool?: boolean): this;

  /**
   * The sprite gets a flipped Y scale. If the scale on that axis was 1, it will become 1 or -1, effectively
   * mirroring the sprite on its vertical axis
   */
  mirrorY(inBool?: boolean): this;

  /**
   * Causes the effect to play beneath most tokens
   */
  belowTokens(inBool?: boolean): this;

  /**
   * Causes the effect to play beneath most tiles
   */
  belowTiles(inBool?: boolean): this;

  /**
   * Causes the effect to play on top of the vision mask
   */
  aboveLighting(inBool?: boolean): this;

  /**
   * Changes the effect's elevation
   */
  elevation(inElevation?: number, inOptions?: { absolute: boolean }): this;

  /**
   * Sets the zIndex of the effect, potentially displaying it on top of other effects the same elevation
   */
  zIndex(inZIndex: number): this;

  /**
   * This method only modifies .persist()-ed effects and causes them to not immediately end, but stick around for the given duration passed to this method.
   */
  extraEndDuration(inExtraDuration: number): this;

  /**
   * Rotates the sprite
   */
  spriteRotation(inAngle: number): this;

  /**
   * Causes the effect to not rotate should its containers rotate
   */
  zeroSpriteRotation(inBool?: boolean): this;

  /**
   * If the effect would loop due to its duration or persistence, this causes it not to
   */
  noLoop(inBool?: boolean): this;

  /**
   * Causes the effect to not show up in the Effect Manager UI - DO NOT USE UNLESS YOU KNOW WHAT YOU ARE DOING
   */
  private(inBool?: boolean): this;

  /**
   * Causes the effect to be played in screen space instead of world space (where tokens are)
   */
  screenSpace(inBool?: boolean): this;

  /**
   * Causes the effect to be played above all of the UI elements
   */
  screenSpaceAboveUI(inBool?: boolean): this;

  /**
   * Positions the effect in a screen space position, offset from its .screenSpaceAnchor()
   */
  screenSpacePosition(inPosition: Vector2): this;

  /**
   * Anchors the sprite according to the given x and y coordinates, or uniformly based on a single number in screen space
   */
  screenSpaceAnchor(inPosition: number | Vector2): this;

  /**
   * Sets up various properties relating to scale of the effect on the screen
   */
  screenSpaceScale(inOptions: {
    x?: number;
    y?: number;
    fitX?: boolean;
    fitY?: boolean;
    ratioX?: boolean;
    ratioY?: boolean;
  }): this;

  /**
   * This is for adding extra information to an effect, like the origin of the effect in the form of the item's uuid.
   *
   * The method accepts a string or a Document that has an UUID.
   */
  origin(inOrigin: string | foundry.abstract.Document): this;

  /**
   * Ties the effect to any number of documents in Foundry - if those get deleted, the effect is ended.
   */
  tieToDocuments(
    inOrigin:
      | string
      | foundry.abstract.Document
      | Array<string | foundry.abstract.Document>
  ): this;

  /**
   * This is for adding extra information to an effect, like the origin of the effect in the form of the item's uuid.
   *
   * The method accepts a string or a Document that has an UUID.
   */
  mask(inObject: VisibleFoundryTypes | Array<VisibleFoundryTypes>): this;

  /**
   * Causes the effect to be visible through walls
   */
  xray(inBool?: boolean): this;
}

declare interface SoundSection
  extends CoreMethods,
    Section<SoundSection>,
    HasFiles<EffectSection>,
    HasAudio<EffectSection>,
    HasTime<EffectSection> {}

declare abstract class SoundSection {
  /**
   * Adds a function that will run at the end of the sound serialization step, but before it is played. Allows direct
   * modifications of sound's data.
   */
  addOverride(inFunc: Function): this;
}

declare interface ScrollingTextSection
  extends CoreMethods,
    Section<ScrollingTextSection>,
    HasLocation<EffectSection>,
    HasText<EffectSection>,
    HasUsers<EffectSection> {}

declare abstract class ScrollingTextSection {
  /**
   * The original anchor point where the text appears
   */
  anchor(inAnchor: string | number): this;

  /**
   * The direction in which the text scrolls
   */
  direction(inDirection: string | number): this;

  /**
   * An amount of randomization between [0, 1] applied to the initial position
   */
  jitter(inDirection: number): this;
}

declare interface CanvasPanSection
  extends CoreMethods,
    Section<CanvasPanSection>,
    HasLocation<EffectSection>,
    HasUsers<EffectSection> {}

declare abstract class CanvasPanSection {
  /**
   * Sets the speed (pixels per frame) of the canvas pan
   */
  speed(inSpeed: number): this;

  /**
   * Sets the zoom level of the canvas pan
   */
  scale(inScale: number): this;

  /**
   * Locks the canvas at the given location for the given duration
   */
  lockView(inDuration: number): this;

  /**
   * Shakes the canvas
   */
  shake(inOptions?: {
    duration?: number,
    strength?: number,
    frequency?: number,
    fadeInDuration?: number,
    fadeOutDuration?: number,
    rotation?: boolean,
  }): this;
}

declare abstract class TokenFactionsFile {}

declare abstract class TokenFactionsDatabase {
  /**
   *  Registers a set of entries to the database on the given module name
   */
  registerEntries(
    inModuleName: string,
    inEntries: object,
    isPrivate?: boolean
  ): boolean;

  /**
   *  Validates the entries under a certain module name, checking whether paths to assets are correct or not
   */
  validateEntries(inModuleName: string): Promise<void>;

  /**
   *  Quickly checks if the entry exists in the database
   */
  entryExists(inString: string): boolean;

  /**
   *  Gets the entry in the database by a dot-notated string
   */
  getEntry(
    inString: string,
    inOptions?: { softFail?: boolean }
  ): TokenFactionsFile | Array<TokenFactionsFile> | Boolean;

  /**
   *  Gets all files under a database path
   */
  getAllFileEntries(inDBPath): Array<string> | boolean;

  /**
   *  Get all valid entries under a certain path
   */
  getPathsUnder(inPath): Array<string>;

  /**
   *  Get all valid entries under a certain path
   */
  searchFor(inPath: string): Array<string> | boolean;
}

declare abstract class TokenFactionsPreloader {
  /**
   * Causes each connected client (including the caller) to fetch and cache the provided file(s) locally, vastly improving loading speed of those files.
   */
  preload(
    inSrc: string | Array<string>,
    showProgressBar?: boolean
  ): Promise<void>;

  /**
   * Caches provided file(s) locally, vastly improving loading speed of those files.
   */
  preloadForClients(
    inSrc: string | Array<string>,
    showProgressBar?: boolean
  ): Promise<void>;
}

declare abstract class TokenFactionsHelpers {
  /**
   * Wait for a duration.
   */
  wait(ms: number): Promise<void>;

  /**
   * Clamps a value between two numbers
   */
  clamp(num: number, min: number, max: number): number;

  /**
   * This function interpolates between p1 and p2 based on a normalized value of t, determined by the ease provided (string or function)
   */
  interpolate(p1: number, p2: number, t: number, ease?: string): number;

  /**
   * Returns a floating point number between a minimum and maximum value
   */
  random_float_between(min: Number, max: Number): number;

  /**
   * Returns an integer between a minimum and maximum value
   */
  random_int_between(min: Number, max: Number): number;

  /**
   * Returns a shuffled copy of the original array.
   */
  shuffle_array(inArray: Array<any>): Array<any>;

  /**
   * Returns a random element in the given array
   */
  random_array_element(
    inArray: Array<any>,
    inOptions?: { recurse?: boolean }
  ): any;

  /**
   *  Returns a random element in the given object
   */
  random_object_element(
    inObject: object,
    inOptions?: { recurse?: boolean }
  ): any;

  /**
   *  Turns an array containing multiples of the same string, objects, etc, and removes duplications, and returns a fresh array
   */
  make_array_unique(inArray: Array<any>): Array<any>;
}

declare class Class {}

declare abstract class TokenFactionsSectionManager {
  /**
   * Registers a class by a name that will then be available through the TokenFactions
   */
  registerSection(
    inModuleName: string,
    inMethodName: string,
    inClass: Class,
    overwrite?: boolean
  ): boolean;
}

declare abstract class TokenFactionsDatabaseViewer {
  /**
   * Opens the TokenFactions database viewer
   */
  show(): Promise<void>;
}

declare abstract class TokenFactionsEffectPlayer {
  /**
   * Opens the TokenFactions Effects UI with the player tab open
   */
  show(): Promise<void>;
}

declare abstract class TokenFactionsEffectManager {
  /**
   * Opens the TokenFactions Effects UI with the effects tab open
   */
  show(): Promise<void>;

  /**
   * Returns all of the currently running effects on the canvas
   */
  get effects(): Array<any>;

  /**
   * Get effects that are playing on the canvas based on a set of filters
   */
  getEffects(options: {
    object?: string | VisibleFoundryTypes;
    name?: string;
    sceneId?: string;
  }): Array<any>;

  /**
   * Updates effects based on a set of filters
   */
  updateEffects(options: {
    object?: string | VisibleFoundryTypes;
    name?: string;
    sceneId?: string;
    effects: string | CanvasEffect | Array<string> | Array<CanvasEffect>;
  }): Promise<Array<any>>;

  /**
   * End effects that are playing on the canvas based on a set of filters
   */
  endEffects(options: {
    object?: string | VisibleFoundryTypes;
    name?: string;
    sceneId?: string;
    effects: string | CanvasEffect | Array<string> | Array<CanvasEffect>;
  }): Promise<void>;

  /**
   * End all effects that are playing on the canvas
   */
  endAllEffects(inSceneId?: string, push?: boolean): Promise<void>;

  /**
   * If an effect has been named its position will be cached, which can be retrieved with this method
   */
  getEffectPositionByName(inName: string): Vector2;
}

declare abstract class TokenFactionsPresets {
  /**
   * Adds a preset that can then be used in sequences through .preset()
   */
  add(
    inName: string,
    inFunction: Function,
    overwrite?: boolean
  ): Map<string, Function>;

  /**
   * Retrieves all presets
   */
  getAll(): Map<string, Function>;

  /**
   * Retrieves preset based on its name
   */
  get(name: string): Function;
}

declare namespace TokenFactions {
  const Database: TokenFactionsDatabase;
  const Presets: TokenFactionsPresets;
  const Preloader: TokenFactionsPreloader;
  const Helpers: TokenFactionsHelpers;
  const DatabaseViewer: TokenFactionsDatabaseViewer;
  const Player: TokenFactionsEffectPlayer;
  const SectionManager: TokenFactionsSectionManager;
  const EffectManager: TokenFactionsEffectManager;
  function registerEase(
    easeName: string,
    easeFunction: Function,
    overwrite?: boolean
  );
}
