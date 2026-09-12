import { signOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/Button";

/** A form so sign-out is a POST (server action), not a navigable link. */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="glass" size="sm">
        Log out
      </Button>
    </form>
  );
}
