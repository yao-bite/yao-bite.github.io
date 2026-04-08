const {
  range,
  filter,
  map,
  merge,
  fromEvent,
  scan,
  timer,
  interval,
  withLatestFrom,
  startWith,
  throttleTime,
  throttle,
  of,
} = rxjs;

const DELAY = 4000;
const THROTTLE = 1000;

function registerAlbum(id, total) {
  range(1, 10).subscribe((x) => console.log(x, id));

  var current = 0;

  var strip = document.getElementById(id + "-strip");
  var prevBtn = document.getElementById(id + "-prev");
  var nextBtn = document.getElementById(id + "-next");

  var viewport = strip.parentElement;

  function update(current) {
    console.log(`${id}: ${current}`);
    strip.style.transform = "translateX(-" + current * 100 + "%)";
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    for (var i = 0; i < total; i++) {
      var dot = document.getElementById(id + "-dot-" + i);
      if (dot)
        dot.className =
          "w-1.5 h-1.5 rounded-full transition-colors " +
          (i === current ? "bg-gray-800" : "bg-gray-300");
    }
  }

  prev = fromEvent(prevBtn, "click").pipe(
    map(() => (c) => (c > 0 ? c - 1 : c)),
  );
  next = fromEvent(nextBtn, "click").pipe(
    map(() => (c) => (c < total - 1 ? c + 1 : c)),
  );
  hover = merge(
    fromEvent(viewport, "mouseover").pipe(map(() => true)),
    fromEvent(viewport, "mouseleave").pipe(map(() => false)),
  ).pipe(startWith(false));
  hover.subscribe(console.log);
  autoplay = interval(DELAY).pipe(
    withLatestFrom(hover),
    filter(([_, hovered]) => !hovered),
    map(() => (c) => (c + 1) % total),
  );

  merge(
    prev,
    next,
    autoplay,
    of((c) => c),
  )
    .pipe(
      throttleTime(THROTTLE),
      scan((current, reducer) => reducer(current), 0),
    )
    .subscribe(update);
}
