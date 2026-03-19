// Mode lookup helpers derived from the legacy JsDataflashParser.

export enum MavType {
  GENERIC = 0,              // Generic micro air vehicle.
  FIXED_WING = 1,           // Fixed wing aircraft.
  QUADROTOR = 2,            // Quadrotor.
  COAXIAL = 3,              // Coaxial helicopter.
  HELICOPTER = 4,           // Normal helicopter with tail rotor.
  ANTENNA_TRACKER = 5,      // Ground installation.
  GCS = 6,                  // Operator control unit / ground control station.
  AIRSHIP = 7,              // Airship, controlled.
  FREE_BALLOON = 8,         // Free balloon, uncontrolled.
  ROCKET = 9,                // Rocket.
  GROUND_ROVER = 10,         // Ground rover.
  SURFACE_BOAT = 11,         // Surface vessel, boat, ship.
  SUBMARINE = 12,            // Submarine.
  HEXAROTOR = 13,            // Hexarotor.
  OCTOROTOR = 14,            // Octorotor.
  TRICOPTER = 15,            // Tricopter.
  FLAPPING_WING = 16,        // Flapping wing.
  KITE = 17,                 // Kite.
  ONBOARD_CONTROLLER = 18,   // Onboard companion controller.
  VTOL_DUOROTOR = 19,        // Two-rotor VTOL using control surfaces in vertical operation in addition. Tailsitter.
  VTOL_QUADROTOR = 20,       // Quad-rotor VTOL using a V-shaped quad config in vertical operation. Tailsitter.
  VTOL_TILTROTOR = 21,       // Tiltrotor VTOL.
  VTOL_RESERVED2 = 22,       // VTOL reserved 2.
  VTOL_RESERVED3 = 23,       // VTOL reserved 3.
  VTOL_RESERVED4 = 24,       // VTOL reserved 4.
  VTOL_RESERVED5 = 25,       // VTOL reserved 5.
  GIMBAL = 26,                // Onboard gimbal.
  ADSB = 27,                  // Onboard ADSB peripheral.
  PARAFOIL = 28,              // Steerable, nonrigid airfoil.
  DODECAROTOR = 29,           // Dodecarotor.
  CAMERA = 30,                // Camera.
  CHARGING_STATION = 31,      // Charging station.
  FLARM = 32,                 // Onboard FLARM collision avoidance system.
  ENUM_END = 33,              // End of enumeration.
}

// APM (Ardupilot Mega) mode mapping.
const MODE_MAP_AHRS = {
  0: "MANUAL",
  1: "CIRCLE",
  2: "STABILIZE",
  3: "TRAINING",
  4: "ACRO",
  5: "FBWA",
  6: "FBWB",
  7: "CRUISE",
  8: "AUTOTUNE",
  10: "AUTO",
  11: "RTL",
  12: "LOITER",
  13: "TAKEOFF",
  14: "AVOID_ADSB",
  15: "GUIDED",
  16: "INITIALISING",
  17: "QSTABILIZE",
  18: "QHOVER",
  19: "QLOITER",
  20: "QLAND",
  21: "QRTL",
  22: "QAUTOTUNE",
  23: "QACRO",
  24: "THERMAL",
} as const;

// ACM (Ardupilot Copter) mode mapping.
const MODE_MAP_COPTER = {
  0: "STABILIZE",
  1: "ACRO",
  2: "ALT_HOLD",
  3: "AUTO",
  4: "GUIDED",
  5: "LOITER",
  6: "RTL",
  7: "CIRCLE",
  9: "LAND",
  11: "DRIFT",
  13: "SPORT",
  14: "FLIP",
  15: "AUTOTUNE",
  16: "POSHOLD",
  17: "BRAKE",
  18: "THROW",
  19: "AVOID_ADSB",
  20: "GUIDED_NOGPS",
  21: "SMART_RTL",
  22: "FLOWHOLD",
  23: "FOLLOW",
  24: "ZIGZAG",
  25: "SYSTEMID",
  26: "AUTOROTATE",
} as const;

const MODE_MAP_ROVER = {
  0: "MANUAL",
  1: "ACRO",
  3: "STEERING",
  4: "HOLD",
  5: "LOITER",
  6: "FOLLOW",
  7: "SIMPLE",
  8: "DOCK",
  9: "CIRCLE",
  10: "AUTO",
  11: "RTL",
  12: "SMART_RTL",
  15: "GUIDED",
  16: "INITIALISING",
} as const;

const MODE_MAP_TRACKER = {
  0: "MANUAL",
  1: "STOP",
  2: "SCAN",
  3: "SERVO_TEST",
  10: "AUTO",
  16: "INITIALISING",
} as const;

const MODE_MAP_SUB = {
  0: "STABILIZE",
  1: "ACRO",
  2: "ALT_HOLD",
  3: "AUTO",
  4: "GUIDED",
  7: "CIRCLE",
  9: "SURFACE",
  16: "POSHOLD",
  19: "MANUAL",
  20: "MOTOR_DETECT",
} as const;

type ModeMap = Record<number, string>;

export function getModeMap(mavType?: number): ModeMap {
  if (mavType === undefined || mavType === null) {
    return MODE_MAP_AHRS;
  }

  if (
    [
      MavType.QUADROTOR,
      MavType.HELICOPTER,
      MavType.HEXAROTOR,
      MavType.OCTOROTOR,
      MavType.COAXIAL,
      MavType.TRICOPTER,
    ].includes(mavType)
  ) {
    return MODE_MAP_COPTER;
  }

  if (mavType === MavType.FIXED_WING) {
    return MODE_MAP_AHRS;
  }

  if (mavType === MavType.GROUND_ROVER) {
    return MODE_MAP_ROVER;
  }

  if (mavType === MavType.ANTENNA_TRACKER) {
    return MODE_MAP_TRACKER;
  }

  if (mavType === MavType.SUBMARINE) {
    return MODE_MAP_SUB;
  }

  console.warn(`Unknown MAV type: ${mavType}`);
  return MODE_MAP_AHRS;
}

export function resolveModeString(modeValue: number, mavType?: number): string | undefined {
  const map = getModeMap(mavType);
  return map[modeValue];
}
