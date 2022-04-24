/** This file contains JSON data for *all* spritesheets.
 *  This file will be included in the <script> tag and 
 *  loaded by the browser. 
 */

// Import JSONs
import { mSixTankBodyData } from "./images_and_data/mSixTankBodyData.js";
import { mSixTankTurretData } from "./images_and_data/mSixTankTurretData.js";
import { shellData } from "./images_and_data/shellData.js";
import { explosionsData } from "./images_and_data/explosionsData.js"; /// Delete if not needed
import { hitData } from "./images_and_data/hitData.js";
import { oasis } from "./maps/maps.js";
import { treadMarkData } from "./images_and_data/treadMarkData.js";

// Export JSONs
export {
    mSixTankBodyData,
    treadMarkData,
    mSixTankTurretData,
    shellData,
    explosionsData, /// Delete if not needed
    hitData,
    oasis
};