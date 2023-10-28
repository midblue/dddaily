<template>
  <div class="confetti-container">
    <div
      v-for="index in 150"
      :key="'confetti' + index"
      :class="`co-${index}`"
    />
  </div>
</template>
<style lang="scss" scoped>
.confetti-container {
  position: absolute !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

[class|='co'] {
  position: absolute;
}

$colors: (
  var(--color1),
  var(--color4),
  var(--color10),
  var(--color15)
);
// (
//   #444,
//   #888,
//   #aaa
// );

@for $i from 0 through 150 {
  $w: random(50);
  $l: random(120) - 10;
  .co-#{$i} {
    width: #{$w}px;
    height: #{$w * 0.4}px;
    background-color: nth($colors, random(4));
    top: -20%;
    left: unquote($l + '%');
    opacity: random() + 0.5;
    transform: rotate(#{random() * 360}deg);
    animation: drop-#{$i}
      unquote(-1 * random() + 's')
      unquote(random() * 5 + 5 + 's');
  }

  @keyframes drop-#{$i} {
    100% {
      top: 150%;
      left: unquote($l + random(100) - 50 + '%');
    }
  }
}
</style>
