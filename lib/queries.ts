import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { validatePassword, validateEmail } from "@/lib/validation";
import { v4 as uuidv4 } from "uuid";

// ─── Username generator ────────────────────────────────────────────────────────
// Pattern: {CleanedLocalPart}#{1000-9999}  e.g. JohnDoe#3847
// Deterministic from email — same input always produces the same name.
// Split on "#" to separate identity (JohnDoe) from instance (3847).

function hashCode(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

function generateUsername(email: string): string {
  const local = email.split("@")[0];
  const cleaned = local
    .split(/[._\-+]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
  const num = String((hashCode(email) % 9000) + 1000); // 1000–9999
  return `${cleaned}#${num}`;
}

async function uploadImage(image?: File | string) {
  let imageUrl: string | undefined =
    typeof image === "string" ? image : undefined;

  if (image instanceof File) {
    const file = image;
    const fileExtension = file.name.split(".").pop();
    const fileNameWithShortUUID = `${uuidv4()}.${fileExtension}`;
    const filePath = `${UploadSubDirectoryEnum.USER_PROFILE}/${fileNameWithShortUUID}`;

    const { signedUrl } = await apiFetch<{ signedUrl: string }>(
      "/api/upload/signed-url",
      {
        method: "POST",
        body: JSON.stringify({ fileName: filePath, type: "user-profile" }),
      },
    );

    await uploadFileToSignedUrl(signedUrl, file);
    imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${filePath}`;
  }

  return imageUrl;
}

// ─── AI helpers ────────────────────────────────────────────────────────────────

// Converts any image format to JPEG base64 using the browser's Canvas API.
// This normalises HEIC, BMP, TIFF, etc. — Claude only accepts jpeg/png/gif/webp.
function normalizeToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const MAX = 1024;
      const scale = Math.min(
        1,
        MAX / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas conversion failed"));
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.85,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

export type DetectPetResult = {
  breed: string;
  color: string;
  gender: "Male" | "Female";
  size: string;
  ageGroup: string;
  weight: number;
  energyLevel?: PetEnergyLevel;
  emotions?: string[];
  socialStyle?: string;
  behaviorTraits?: string[];
  goodWith?: string[];
  considerNotes?: string;
};

export function useDetectPet() {
  return useMutation({
    mutationFn: async (file: File): Promise<DetectPetResult> => {
      const imageBase64 = await normalizeToJpeg(file);
      return apiFetch<DetectPetResult>("/api/detect-pet", {
        method: "POST",
        body: JSON.stringify({ imageBase64, mediaType: "image/jpeg" }),
      });
    },
  });
}

export function useGeneratePhoto(prompt: string) {
  return useMutation({
    mutationFn: async (): Promise<string[]> => {
      const res = await fetch(
        `/api/images/generate?context=${encodeURIComponent(prompt)}`,
      );
      const data = await res.json();
      return data.images ?? [];
    },
  });
}

// ─── Upload helpers ────────────────────────────────────────────────────────────

async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Failed to upload image");
}

// ─── Query Keys ────────────────────────────────────────────────────────────────
// Centralise all keys so invalidation is consistent across the app
export const keys = {
  activities: ["activities"] as const,
  userActivities: (id: string) => ["activities", id] as const,
  activity: (id: string) => ["activity", id] as const,
  profile: (userId: string) => ["profile", userId] as const,
};

// ─── Compatibility ─────────────────────────────────────────────────────────────

export type CompatibilityResult = { score: number; reason: string };

export function useCompatibility(
  params: {
    breed?: string;
    size?: string;
    vaccine?: boolean;
    fleaTick?: boolean;
    activityType?: string;
    activitySizes?: string[];
  } | null,
) {
  return useQuery({
    queryKey: ["compatibility", params],
    queryFn: () =>
      apiFetch<CompatibilityResult>("/api/compatibility", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    enabled: !!params?.activityType,
    staleTime: Infinity,
  });
}

// ─── Places ────────────────────────────────────────────────────────────────────

export type PlacePrediction = {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
};

export function usePlacesAutocomplete(query: string) {
  return useQuery({
    queryKey: ["places", "autocomplete", query],
    queryFn: () =>
      apiFetch<{ predictions: PlacePrediction[] }>(
        `/api/places/autocomplete?q=${encodeURIComponent(query)}`,
      ).then((d) => d.predictions),
    enabled: query.trim().length >= 1,
    staleTime: Infinity, // results are cached in DB — no need to re-fetch
    placeholderData: [],
  });
}

// ─── Activities ────────────────────────────────────────────────────────────────

export function useActivities(userId?: string) {
  return useQuery({
    queryKey: userId ? ["userActivities", userId] : keys.activities,
    queryFn: () =>
      apiFetch<Activity[]>(
        `/api/activities${userId ? `?userId=${userId}` : ""}`,
      ),
  });
}

export function useActivity(activityId: string) {
  return useQuery({
    queryKey: keys.activity(activityId),
    queryFn: () => apiFetch<Activity>(`/api/activities/${activityId}`),
    enabled: !!activityId, // only run when id is available
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: Partial<Omit<Activity, "_id" | "userId" | "image">> & {
        image?: File | string;
      },
    ) => {
      const imageUrl = await uploadImage(body.image);

      return apiFetch<{ id: string }>("/api/activities", {
        method: "POST",
        body: JSON.stringify({ ...body, image: imageUrl }),
      });
    },
    onSuccess: () => {
      // Refresh the activity list after creating
      queryClient.invalidateQueries({ queryKey: keys.activities });
    },
  });
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: (message: string) =>
      apiFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
  });
}

export function useEndActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/activities/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ended" }),
      }),
    onSuccess: () => {
      // Refresh the activity list after creating
      queryClient.invalidateQueries({ queryKey: keys.activity(id) });
    },
  });
}

export function useUpdateActivity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Activity>) =>
      apiFetch(`/api/activities/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.activity(id) });
    },
  });
}

export function useAttendees(activityId: string) {
  return useQuery({
    queryKey: ["attendees"],
    queryFn: () =>
      apiFetch<Activity>(
        `/api/attendees${activityId ? `?activityId=${activityId}` : ""}`,
      ),
  });
}

export function useCreateAttendees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AttendeeReq>) =>
      apiFetch(`/api/attendees`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      queryClient.invalidateQueries({ queryKey: keys.activities });
    },
  });
}

export function useUpdateAttendee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { _id: string; status: "joined" | "rejected" }) =>
      apiFetch(`/api/attendees`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.activities });
    },
  });
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["userProfile", keys.profile(userId ?? "owner")],
    queryFn: async () => {
      const [user, pets] = await Promise.all([
        apiFetch<User>(`/api/profile${userId ? `?userId=${userId}` : ""}`),
        apiFetch<Pet[]>(`/api/pets?userId=${userId ?? "owner"}`),
      ]);
      return { user, pets };
    },
  });
}

export function useUpdateProfile(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Omit<User, "_id"> | { image: File | string }) => {
      if (!userId)
        return Promise.reject(new Error("useUpdateProfile requires a userId"));

      const imageUrl = await uploadImage(body.image);

      return apiFetch(`/api/profile?userId=${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...body, image: imageUrl }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.profile(userId ?? "") });
    },
  });
}

export function useIncrementAiPhotoCount(
  userId: string | undefined,
  field: "aiProfilePhotoCount" | "aiCoverImageCount",
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (currentCount: number) =>
      apiFetch(`/api/profile?userId=${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: currentCount + 1 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [keys.profile(userId ?? "")] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });
}

export function usePetProfile(petId: string) {
  return useQuery({
    queryKey: ["petProfile", petId],
    queryFn: () => apiFetch<Pet>(`/api/pets/${petId ? `?petId=${petId}` : ""}`),
  });
}

export function useCreatePetProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body:
        | Omit<Pet, "_id" | "userId" | "followers" | "following" | "rating">
        | { image: File | string },
    ) => {
      const imageUrl = await uploadImage(body.image);

      return apiFetch<{ petId: string }>("/api/pets", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          image: imageUrl,
          followers: 0,
          following: 0,
          rating: 0,
          sterilizing: false,
          locationName: "Thailand",
          latitude: undefined,
          longitude: undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useUpdatePetProfile(petId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: Partial<Omit<Pet, "_id" | "userId" | "image">> & {
        image?: File | string;
      },
    ) => {
      const imageUrl = await uploadImage(body.image);

      return apiFetch(`/api/pets?petId=${petId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...body, ...(imageUrl && { image: imageUrl }) }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petProfile", petId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useVerifyVaccine() {
  return useMutation({
    mutationFn: (body: { image: string; mimeType: string }) =>
      apiFetch<{
        vaccines: {
          name: string;
          date: string;
          nextDate: string | null;
          isCurrent: boolean;
        }[];
        hasCurrentVaccine: boolean;
        summary: string;
      }>("/api/pets/verify-vaccine", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useVerifyPetCard() {
  return useMutation({
    mutationFn: (body: { image: string; mimeType: string }) =>
      apiFetch<{
        microchipCode: string;
        vaccine: boolean;
        sterilizing: boolean;
        petName: string | null;
        breed: string | null;
        breedEnglish: string | null;
      }>("/api/pets/verify-card", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiFetch<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    // Cookie is set by the server — nothing extra needed here
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      // Stamp null immediately — no re-fetch needed, cookies are already gone.
      // Any observer (useRequireGuest / useRequireAuth) gets isLoading:false + user:null instantly.
      queryClient.setQueryData(["authUser"], null);
    },
  });
}

export function useAuthUser() {
  return useQuery({
    queryKey: ["authUser"],
    // clears both cookies and returns null, which triggers useRequireAuth
    // to redirect to /login.
    queryFn: () =>
      fetch("/api/auth/user").then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<User | null>;
      }),
    staleTime: Infinity, // never auto-refetch on a timer
    refetchOnWindowFocus: true, // re-validate when user returns to the tab
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => {
      const emailError = validateEmail(email);
      if (emailError) throw new Error(emailError);

      const { valid, error } = validatePassword(password);
      if (!valid) throw new Error(error);

      const defaultValue = {
        name: generateUsername(email),
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC4gSy4vsT1ox_x5hsjIqAmtZvDGD0M2bz-Uc-S4ZXfvNx36-WMJIw3A_wTsq5V3SCLMA0WH42p17-dMPIzXglkeUOsDRV-KMglvxdMqsn5otPKKYnZfGay0Fk_LhmBHFeJ4_NfpSYIs7vhmz6q1rhpFMxBbLcBPoX-yVbc24dWvSWvzrFNg1QiLhlGhPL_SzzADktBskiBTdfJEpQrIn9IMdb1Z_YpxruXx7w06DoBG4mT7U1Xj0bE8scY1OKxCaOPohC1dB1pm-8c",
        locationName: "Thailand",
        latitude: undefined,
        longitude: undefined,
        bio: '"Tell us about yourself and your dog!"',
        followers: 0,
        following: 0,
        rating: 0,
        tier: Tier.Beginner,
      };

      return apiFetch<{ id: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, ...defaultValue }),
      });
    },
    onSuccess: () => {
      // Cookie is now set server-side — force authUser to refetch so
      // useRequireAuth sees the new user instead of null.
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      }),
  });
}

export function useCheckName() {
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<{ available: boolean }>(
        `/api/users/check-name?name=${encodeURIComponent(name)}`,
      ),
  });
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Activity = {
  _id: string;
  owner: { _id: string; name: string; image: string };
  title: string;
  description?: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  startDate?: Date;
  endDate?: Date;
  type: string;
  sizes: PetSizeCategory[];
  amountOfAttendees: number;
  maxDogs: number;
  image?: string;
  status: "active" | "ended";
  hostId: string;
  attendees: Attendee[];
  hostType?: "personal" | "business";
  autoEnd?: boolean;
  petRequirements?: string[];
};

export type Pet = {
  _id: string;
  userId: string;
  name?: string;
  image?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  followers: number;
  following: number;
  rating: number;
  dateOfBirth?: Date;
  gender?: Gender;
  ageGroup?: PetAgeGroup;
  breed?: string;
  weight?: number;
  size?: string;
  vaccine?: boolean;
  fleaTick?: boolean;
  sterilizing?: boolean;
  microchipVerified?: boolean;
  energyLevel?: PetEnergyLevel;
  emotions?: string[];
  socialStyle?: string;
  behaviorTraits?: string[];
  goodWith?: string[];
  considerNotes?: string;
};

export type User = {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  followers: number;
  following: number;
  rating: number;
  dateOfBirth?: Date;
  gender?: Gender;
  tier: Tier;
  aiProfilePhotoCount?: number;
  aiCoverImageCount?: number;
};

export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}

export enum Tier {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

export enum UploadSubDirectoryEnum {
  USER_PROFILE = "pawFriends/user/profile",
  PET_PROFILE = "pawFriends/pet/profile",
  ACTIVITY_IMAGE = "pawFriends/activity/image",
}

export enum PetAgeGroup {
  Puppy = "Puppy",
  Young = "Young",
  Adult = "Adult",
  Senior = "Senior",
}

export enum PetEnergyLevel {
  Low,
  Medium,
  High,
  VeryHigh,
}

// export enum PetSocialStyle {
//   Amiable = "Amiable",
//   Shy = "Shy",
//   Aggressive = "Aggressive",
//   Independent = "Independent",
//   Expressive = "Expressive",
//   Analytical = "Analytical",
//   Avoidant = "Avoidant",
// }

export type PetSizeCategory = "XS" | "SM" | "MD" | "LG" | "XL";

export type Attendee = {
  _id: string;
  image: string;
  name: string;
  role: "pet" | "owner";
  status: "pending" | "joined" | "rejected";
  requestMessage?: string;
  ownerId?: string;
  attendeeId?: string;
};

export type AttendeeReq = {
  _id: string;
  attendeeId: string;
  activityId: string;
  status?: "pending" | "joined" | "rejected";
  requestMessage?: string;
  role: "pet" | "user";
};
