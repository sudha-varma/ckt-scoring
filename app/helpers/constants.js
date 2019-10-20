export default {
  // Series Model
  seriesFormatTypes: ["international", "domestic", "league", "women"],
  seriesLiveStatusTypes: ["upcoming", "ongoing", "completed"],
  seriesFilterTypes: ["featured", "popular", "archive", "recent"],
  // Match model
  matchFormatTypes: ["odi", "t20", "test"],
  matchLiveStatusTypes: ["upcoming", "ongoing", "completed"],
  matchFilterTypes: ["featured", "popular", "archive", "recent"],
  // Team model
  teamTypes: ["international", "domestic", "league", "women"],
  // Player model
  playerRoleTypes: ["batsman", "baller", "all rounder", "keeper"],
  battingStyleTypes: ["right handed bat", "left handed bat"],
  bowlingStyleTypes: [
    "right-arm fast",
    "right-arm fast medium",
    "right-arm medium fast",
    "right-arm medium",
    "left-arm fast",
    "left-arm fast medium",
    "left-arm medium fast",
    "left-arm medium",
    "off break",
    "leg break",
    "slow left-arm orthodox",
    "slow left-arm chinaman",
  ],
  // ScoreCard model
  cardType: ["Micro", "Summary", "Full"],
  scoreCardFilterTypes: ["featured", "popular", "archive", "recent"],
  // BallByBall model
  highlightTypes: ["normal", "wicket", "four", "six", "milestone"],
  // common
  statusTypes: ["active", "deleted"],
  sourceTypes: ["cricketapi", "opta", "cricviz"],
  feedSourceTypes: ["cricketapi", "opta"],
  predictionSourceTypes: ["cricviz"],
  approvalStatusTypes: ["pending", "approved", "rejected", "duplicate"],
  minShortStr: 1,
  maxShortStr: 10,
  minStr: 1,
  maxStr: 50,
  minLongStr: 1,
  maxLongStr: 100,
  minVeryLongStr: 1,
  maxVeryLongStr: 200,
  sortByKeys: ["createdAt", "-createdAt", "updatedAt", "-updatedAt"],
};
