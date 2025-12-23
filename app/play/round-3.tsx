import FidelityContainer from "@/components/FidelityContainer";
import BranchingRoundScreen from "@/components/game/BranchingRoundScreen";

export default function RoundThreeScreen() {
  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/play.png")}>
      <BranchingRoundScreen roundIndex={2} nextRoute="/play/reveal" />
    </FidelityContainer>
  );
}
