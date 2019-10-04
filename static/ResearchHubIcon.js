import React from "react";

const ResearchHubIcon = (props) => (
  <svg width={216} height={61} fill="none" {...props}>
    <path fill="url(#prefix__pattern0)" d="M0 0h216v61H0z" {...props} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M34.175 27.651l8.797 13.883c.652 1.04.778 1.93.375 2.67-.402.741-1.22 1.112-2.456 1.112H20.745c-1.236 0-2.055-.37-2.457-1.112-.402-.74-.277-1.631.376-2.67L27.46 27.65v-6.985l.027-2.102h6.667l.021 2.102v6.985zm-4.826 1.19l-4.17 6.133h11.283l-4.176-6.133-.35-.543v-7.633h-2.238v7.633l-.35.543z"
      fill="#4E53FF"
    />
    <rect
      x={23.171}
      y={11.177}
      width={4.137}
      height={4.141}
      rx={2.068}
      fill="#4E53FF"
    />
    <rect
      x={33.513}
      y={11.177}
      width={4.137}
      height={4.141}
      rx={2.068}
      fill="#4E53FF"
    />
    <rect
      x={29.376}
      y={6}
      width={3.103}
      height={3.106}
      rx={1.551}
      fill="#4E53FF"
    />
    <rect
      x={25.179}
      y={18.308}
      width={11.282}
      height={2.564}
      rx={1.282}
      fill="#4E53FF"
    />
    <defs>
      <pattern
        id="prefix__pattern0"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <use xlinkHref="#prefix__image0" transform="scale(.00264 .00935)" />
      </pattern>
      <image
        id="prefix__image0"
        width={379}
        height={107}
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default ResearchHubIcon;
