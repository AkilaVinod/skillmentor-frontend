import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getMentors, createSubject } from "@/lib/api";
import type { MentorDTO } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertCircle, BookOpen } from "lucide-react";

const schema = z.object({
  subjectName: z
    .string()
    .min(5, "Subject name must be at least 5 characters")
    .max(255, "Subject name must not exceed 255 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  courseImageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  mentorId: z.string().min(1, "Please select a mentor"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateSubjectPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorDTO[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subjectName: "",
      description: "",
      courseImageUrl: "",
      mentorId: "",
    },
  });

  useEffect(() => {
    getMentors(0, 100)
      .then((data) => setMentors(data.content))
      .catch(() => {})
      .finally(() => setLoadingMentors(false));
  }, []);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await createSubject(
        {
          subjectName: values.subjectName,
          description: values.description,
          courseImageUrl: values.courseImageUrl || undefined,
          mentorId: values.mentorId,
        },
        token
      );

      setSuccess(true);
      setTimeout(() => navigate("/admin/subjects"), 1500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create subject");
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Subject Created!</h2>
        <p className="text-muted-foreground">Redirecting to your subjects list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Create Subject</h1>
          <p className="text-muted-foreground text-sm">
            Add a new subject and assign it to a mentor
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>
            Fill in the subject information below. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Subject Name */}
              <FormField
                control={form.control}
                name="subjectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to React" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what students will learn..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Image URL */}
              <FormField
                control={form.control}
                name="courseImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mentor */}
              <FormField
                control={form.control}
                name="mentorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Mentor *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingMentors}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingMentors ? "Loading mentors..." : "Select a mentor"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mentors.map((m) => (
                          <SelectItem key={m.mentorId} value={m.mentorId}>
                            {m.firstName} {m.lastName}
                            {m.title ? ` — ${m.title}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Creating..." : "Create Subject"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
