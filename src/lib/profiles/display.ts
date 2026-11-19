import type { StudentProfileCardData } from "@/lib/profiles/types";

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function hasSocialLinks(
  student: Pick<StudentProfileCardData, "socialLinks">,
): boolean {
  return student.socialLinks.length > 0;
}
