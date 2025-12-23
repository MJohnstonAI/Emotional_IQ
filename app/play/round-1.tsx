import FidelityContainer from "@/components/FidelityContainer";
import BranchingRoundScreen from "@/components/game/BranchingRoundScreen";

export default function RoundOneScreen() {
  return (
    <FidelityContainer reference={require("../../assets/stitch-reference/play.png")}>
      <BranchingRoundScreen roundIndex={0} nextRoute="/play/round-2" />
    </FidelityContainer>
  );
}
