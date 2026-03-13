import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createMentor } from "@/lib/api";
import type { MentorProvisionResponse } from "@/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, AlertCircle, Users, BadgeCheck } from "lucide-react";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    email: z.string().email("Must be a valid email"),
    phoneNumber: z.string().max(20).optional().or(z.literal("")),
    title: z.string().max(100).optional().or(z.literal("")),
    profession: z.string().max(100).optional().or(z.literal("")),
    company: z.string().max(100).optional().or(z.literal("")),
    experienceYears: z
      .number({ message: "Must be a number" })
      .min(0)
      .max(50)
      .optional(),
    bio: z.string().max(500).optional().or(z.literal(""run)),
    profileImageUrl: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    isCertified: z.boolean().optional(),
    startYear: z.string().max(10).optional().or(z.literal("")),
  })
  .refine((values) => !values.startYear || /^\d{4}$/.test(values.startYear), {
    message: "Start year must be a 4-digit year",
    path: ["startYear"],
  });

type FormValues = z.infer<typeof schema>;

export default function CreateMentorPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdMentor, setCreatedMentor] =
    useState<MentorProvisionResponse | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      title: "",
      profession: "",
      company: "",
      experienceYears: undefined,
      bio: "",
      profileImageUrl: "",
      isCertified: false,
      startYear: "",
    },
  });

  const watchImage = form.watch("profileImageUrl");
  const watchFirstName = form.watch("firstName");
  const watchLastName = form.watch("lastName");
  const watchTitle = form.watch("title");
  const watchCertified = form.watch("isCertified");

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const mentor = await createMentor(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber || undefined,
          title: values.title || undefined,
          profession: values.profession || undefined,
          company: values.company || undefined,
          experienceYears: values.experienceYears,
          bio: values.bio || undefined,
          profileImageUrl: values.profileImageUrl || undefined,
          isCertified: values.isCertified,
          startYear: values.startYear || undefined,
        },
        token,
      );
      setCreatedMentor(mentor);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create mentor",
      );
    }
  }

  if (createdMentor) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Mentor Created!</h2>
          <p className="text-muted-foreground">
            {createdMentor.mentor.firstName} {createdMentor.mentor.lastName} has
            been added as a mentor.
          </p>
        </div>
        <Card>
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              {createdMentor.mentor.profileImageUrl ? (
                <img
                  src={createdMentor.mentor.profileImageUrl}
                  alt="mentor"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {createdMentor.mentor.firstName?.[0]}
                  {createdMentor.mentor.lastName?.[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">
                  {createdMentor.mentor.firstName}{" "}
                  {createdMentor.mentor.lastName}
                </p>
                {createdMentor.mentor.title && (
                  <p className="text-sm text-muted-foreground">
                    {createdMentor.mentor.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {createdMentor.mentor.email}
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <p className="text-sm font-semibold">Mentor login credentials</p>
              <p className="text-sm text-muted-foreground">
                Share these credentials securely. The temporary password is only
                shown once.
              </p>
              <div className="text-sm">
                <span className="font-medium">Email:</span>{" "}
                <span className="font-mono">{createdMentor.loginEmail}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Temporary password:</span>{" "}
                <span className="font-mono">
                  {createdMentor.temporaryPassword}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Clerk user ID:</span>{" "}
                <span className="font-mono">{createdMentor.clerkUserId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setCreatedMentor(null);
              form.reset();
            }}
            className="flex-1"
          >
            Create Another
          </Button>
          <Button
            onClick={() => navigate(`/mentors/${createdMentor.mentor.id}`)}
            className="flex-1"
          >
            View Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Create Mentor</h1>
          <p className="text-muted-foreground text-sm">
            Onboard a new mentor, create their Clerk login, and issue a
            temporary password
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Identity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Identity</CardTitle>
                  <CardDescription>
                    Basic identification for the mentor account and Clerk login
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Professional */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Professional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Senior Software Engineer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Engineer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience (years)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              placeholder="5"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="2018"
                              min="1900"
                              max="2100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of the mentor's expertise and experience..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Media & Certification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Media & Certification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/photo.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isCertified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Certified</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Mark this mentor as a certified professional
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {submitError && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Creating..."
                    : "Create Mentor"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Preview card */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Preview
            </p>
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 flex items-center gap-4">
                <div className="relative shrink-0">
                  {watchImage ? (
                    <img
                      src={watchImage}
                      alt="preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-background"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border-2 border-background">
                      {watchFirstName?.[0] ?? "?"}
                      {watchLastName?.[0] ?? ""}
                    </div>
                  )}
                  {watchCertified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-primary fill-background" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {watchFirstName || "First"} {watchLastName || "Last"}
                  </p>
                  {watchTitle && (
                    <p className="text-xs text-muted-foreground">
                      {watchTitle}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
