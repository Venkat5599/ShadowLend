/**
 * ShadowLend Program IDL
 * Auto-generated from Anchor build
 */

// Import the JSON IDL directly
import idlJson from './shadowlend_program.json'

export const SHADOWLEND_IDL = idlJson

// Instruction discriminators (first 8 bytes of sha256("global:<instruction_name>"))
export const DISCRIMINATORS = {
  initializePool: [95, 180, 10, 172, 84, 174, 232, 40],
  deposit: [242, 35, 198, 137, 82, 225, 242, 182],
  borrow: [228, 253, 131, 202, 207, 116, 89, 18],
  withdraw: [183, 18, 70, 156, 148, 109, 161, 34],
  repay: [234, 103, 67, 82, 208, 234, 219, 166],
  liquidate: [223, 179, 226, 125, 48, 46, 39, 74],
  updateInterest: [183, 51, 59, 111, 2, 0, 12, 50],
} as const

// Program address from IDL
export const PROGRAM_ADDRESS = idlJson.address
