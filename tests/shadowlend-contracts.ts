import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ShadowlendContracts } from "../target/types/shadowlend_contracts";
import { expect } from "chai";

describe("shadowlend-contracts", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ShadowlendContracts as Program<ShadowlendContracts>;

  it("Is initialized!", async () => {
    // Add your test here.
    console.log("Your transaction signature", program.programId.toString());
    expect(program.programId).to.not.be.null;
  });
});