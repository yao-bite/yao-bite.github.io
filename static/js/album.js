const {
  filter,
  map,
  merge,
  fromEvent,
  scan,
  timer,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
  startWith,
  throttleTime,
  tap,
  share,
} = rxjs;

const DELAY = 4000;
const THRESHOLD = 40;

function registerAlbum(id, total) {
  let strip = document.getElementById(id + "-strip");
  let prevBtn = document.getElementById(id + "-prev");
  let nextBtn = document.getElementById(id + "-next");
  let viewport = strip.parentElement;

  // Closure variable so drag move side-effects can read current slide index
  let currentSlide = 0;

  function update(current) {
    currentSlide = current;
    strip.style.transform = "translateX(-" + current * 100 + "%)";
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    for (let i = 0; i < total; i++) {
      let dot = document.getElementById(id + "-dot-" + i);
      if (dot) {
        dot.className =
          "w-1.5 h-1.5 rounded-full transition-colors " +
          (i === current ? "bg-gray-800" : "bg-gray-300");
      }
    }
  }

  // — prev / next —
  let prev = fromEvent(prevBtn, "click").pipe(
    map(function () {
      return function (c) {
        return c > 0 ? c - 1 : c;
      };
    }),
  );

  let next = fromEvent(nextBtn, "click").pipe(
    map(function () {
      return function (c) {
        return c < total - 1 ? c + 1 : c;
      };
    }),
  );

  // — dot clicks —
  let dotStreams = [];
  for (let di = 0; di < total; di++) {
    (function (idx) {
      let dot = document.getElementById(id + "-dot-" + idx);
      if (dot) {
        dotStreams.push(
          fromEvent(dot, "click").pipe(
            map(function () {
              return function (_c) {
                return idx;
              };
            }),
          ),
        );
      }
    })(di);
  }
  let dots = dotStreams.length > 0 ? merge.apply(null, dotStreams) : rxjs.EMPTY;

  // — hover state (suppresses autoplay) —
  let hover = merge(
    fromEvent(viewport, "mouseover").pipe(
      map(function () {
        return true;
      }),
    ),
    fromEvent(viewport, "mouseleave").pipe(
      map(function () {
        return false;
      }),
    ),
  ).pipe(startWith(false));

  // — drag / swipe —
  //
  // dragStartEvents emits the starting clientX on mousedown / touchstart.
  // switchMap models each drag lifecycle:
  //   1. CSS transition is disabled immediately (side-effect in switchMap projection).
  //   2. liveFeedback$ moves the strip imperatively on every move event.
  //      It is filtered to never emit, so nothing reaches the outer scan.
  //   3. commit$ fires exactly once on the first dragEnd, re-enables the
  //      transition, and emits the appropriate reducer based on drag distance.
  // The drag stream is shared so that autoplay and the final merge both
  // reference the same underlying subscription.

  let dragStartEvents = merge(
    fromEvent(viewport, "mousedown").pipe(
      map(function (e) {
        return e.clientX;
      }),
    ),
    fromEvent(viewport, "touchstart", { passive: true }).pipe(
      map(function (e) {
        return e.touches[0].clientX;
      }),
    ),
  );

  let dragMoveEvents = merge(
    fromEvent(window, "mousemove").pipe(
      map(function (e) {
        return e.clientX;
      }),
    ),
    fromEvent(viewport, "touchmove", { passive: true }).pipe(
      map(function (e) {
        return e.touches[0].clientX;
      }),
    ),
  );

  let dragEndEvents = merge(
    fromEvent(window, "mouseup"),
    fromEvent(viewport, "touchend"),
  ).pipe(share());

  let drag = dragStartEvents.pipe(
    switchMap(function (startX) {
      strip.style.transition = "none";
      let lastDx = 0;

      // Live visual feedback — imperatively moves the strip, never emits a value.
      let liveFeedback$ = dragMoveEvents.pipe(
        takeUntil(dragEndEvents),
        tap(function (clientX) {
          lastDx = clientX - startX;
          let base = currentSlide * viewport.offsetWidth;
          strip.style.transform = "translateX(" + (-base + lastDx) + "px)";
        }),
        filter(function () {
          return false;
        }),
      );

      // Commit — emits exactly one reducer on the first dragEnd event.
      // We share dragEndEvents so that takeUntil(dragEndEvents) in liveFeedback$
      // and this subscription see the same multicasted emission.
      let commit$ = dragEndEvents.pipe(
        map(function () {
          strip.style.transition = "";
          let dx = lastDx;
          if (dx < -THRESHOLD) {
            return function (c) {
              return c < total - 1 ? c + 1 : c;
            };
          } else if (dx > THRESHOLD) {
            return function (c) {
              return c > 0 ? c - 1 : c;
            };
          } else {
            return function (c) {
              return c;
            };
          }
        }),
        // take(1) so commit$ completes after one dragEnd — the switchMap will
        // handle cleanup of any subsequent drag automatically.
        take(1),
      );

      return merge(liveFeedback$, commit$);
    }),
    // Share so that autoplay (userAction) and the final merge both use
    // the same subscription rather than creating two independent streams.
    share(),
  );

  // — wheel (horizontal swipe / shift+scroll) —
  let wheel = fromEvent(viewport, "wheel", { passive: false }).pipe(
    tap(function (e) {
      if (e.shiftKey) {
        e.preventDefault();
      }
    }),
    filter(function (e) {
      let dx = e.shiftKey ? e.deltaY : e.deltaX;
      return Math.abs(dx) >= 5;
    }),
    throttleTime(400),
    map(function (e) {
      let dx = e.shiftKey ? e.deltaY : e.deltaX;
      if (dx > 0) {
        return function (c) {
          return c < total - 1 ? c + 1 : c;
        };
      } else {
        return function (c) {
          return c > 0 ? c - 1 : c;
        };
      }
    }),
  );

  // — autoplay —
  // Any user action resets the interval. A synchronous seed fires immediately
  // so the timer starts on page load without requiring a user interaction.
  let userAction = merge(prev, next, drag);

  let seed$ = new rxjs.Observable(function (subscriber) {
    subscriber.next("reset");
    subscriber.complete();
  });

  let autoplay = merge(
    seed$,
    userAction.pipe(
      map(function () {
        return "reset";
      }),
    ),
  ).pipe(
    switchMap(function () {
      return timer(DELAY, DELAY).pipe(
        withLatestFrom(hover),
        filter(function (pair) {
          return !pair[1];
        }),
        map(function () {
          return function (c) {
            return (c + 1) % total;
          };
        }),
      );
    }),
  );

  // — wire all reducer streams into a single scan —
  merge(prev, next, dots, drag, wheel, autoplay)
    .pipe(
      scan(function (c, reducer) {
        return reducer(c);
      }, 0),
    )
    .subscribe(update);

  // Initial render
  update(0);
}
