import { redirect } from "next/navigation";
import { courseProfilePath } from "@/lib/profile";

export default function HomePage() {
  redirect(courseProfilePath);
}
