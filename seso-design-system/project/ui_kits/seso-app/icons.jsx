/* Seso UI kit — icon set.
   NOTE: line icons approximate Lucide (https://lucide.dev) — the closest
   open match to Seso's clean ~2px stroke set; the real app icons were not
   extractable from the public site. 24×24, stroke 2, round caps/joins. */
(function () {
  const S = (paths, extra) =>
    function Icon(props) {
      const { size = 20, color = "currentColor", strokeWidth = 1.9, style, ...rest } = props || {};
      return React.createElement(
        "svg",
        {
          viewBox: "0 0 24 24",
          width: size,
          height: size,
          fill: "none",
          stroke: color,
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          style,
          "aria-hidden": "true",
          ...rest,
        },
        paths.map((d, i) =>
          d.c
            ? React.createElement("circle", { key: i, cx: d.c[0], cy: d.c[1], r: d.c[2] })
            : React.createElement("path", { key: i, d })
        )
      );
    };

  const Icons = {
    LayoutDashboard: S(["M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"]),
    Users: S(["M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 19v-2a4 4 0 0 0-3-3.87", { c: [9, 7, 4] }, "M16 3.1a4 4 0 0 1 0 7.8"]),
    FileText: S(["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5", "M9 13h6", "M9 17h6"]),
    DollarSign: S(["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]),
    CreditCard: S(["M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z", "M2 10h20"]),
    Briefcase: S(["M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z", "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M3 12h18"]),
    Settings: S([{ c: [12, 12, 3] }, "M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.6H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 .9 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"]),
    Bell: S(["M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.7 21a2 2 0 0 1-3.4 0"]),
    Search: S([{ c: [11, 11, 7] }, "M21 21l-4.3-4.3"]),
    ChevronRight: S(["M9 6l6 6-6 6"]),
    Plus: S(["M12 5v14", "M5 12h14"]),
    MoreHorizontal: S([{ c: [5, 12, 1] }, { c: [12, 12, 1] }, { c: [19, 12, 1] }]),
    LogOut: S(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]),
    AtSign: S([{ c: [12, 12, 4] }, "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"]),
    Calendar: S(["M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "M16 3v4", "M8 3v4", "M4 10h16"]),
    MapPin: S(["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z", { c: [12, 10, 3] }]),
    Home: S(["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5"]),
    ExternalLink: S(["M15 3h6v6", "M10 14 21 3", "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"]),
    Download: S(["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"]),
    Play: S(["M6 4l14 8-14 8z"]),
    Globe: S([{ c: [12, 12, 9] }, "M3 12h18", "M12 3a14 14 0 0 1 0 18", "M12 3a14 14 0 0 0 0 18"]),
    Clock: S([{ c: [12, 12, 9] }, "M12 7v5l3 2"]),
  };

  window.SesoIcons = Icons;
})();
