import Frame from "../../../components/Frame";
import ProfileView from "../../../components/ProfileView";

export default function ProfilePage() {
  return (
    <Frame word="You" caption="THE SOURCE OF TRUTH" step={-1}>
      <ProfileView />
    </Frame>
  );
}
