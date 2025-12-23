import FidelityContainer from "@/components/FidelityContainer";
import BranchingRoundScreen from "@/components/game/BranchingRoundScreen";

export default function RoundTwoScreen() {
  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/play.png")}>
      <BranchingRoundScreen roundIndex={1} nextRoute="/play/round-3" />
    </FidelityContainer>
  );
}
