import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate, Link } from "react-router";
import { uploadPaymentProof } from "@/lib/api";
import type { SessionDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, ArrowLeft, Upload, CreditCard } from "lucide-react";

export default function PaymentPage() {
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session as SessionDTO | undefined;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError(null);
    setFile(selected);

    if (!selected.type.startsWith("image/")) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    if (!file) {
      setError("Please upload your payment proof.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await uploadPaymentProof(
        {
          sessionId: session.id,
          paymentMethod,
          paymentReference,
          paymentNotes,
          file,
        },
        token
      );

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload payment proof");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">No session selected</h2>
        <p className="text-muted-foreground mb-6">
          Please navigate here from your dashboard.
        </p>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Submitted!</h2>
        <p className="text-muted-foreground mb-6">
          Your payment proof has been submitted for review. An admin will confirm
          the booking once the payment is verified.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Submit Payment Details</h1>

      <Card className="mb-6 bg-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mentor</span>
            <span className="font-medium">{session.mentorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subject</span>
            <span className="font-medium">{session.subjectName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">
              {new Date(session.sessionAt).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">{session.durationMinutes ?? 60} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Status</span>
            <span className="font-medium text-orange-600">{session.paymentStatus}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Proof
          </CardTitle>
          <CardDescription>
            Upload your receipt and provide any transfer reference before the booking can be confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CASH_DEPOSIT">Cash Deposit</SelectItem>
                  <SelectItem value="MOBILE_PAYMENT">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-reference">Payment Reference</Label>
              <Input
                id="payment-reference"
                placeholder="Transaction ID, receipt number, or other reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Slip / Payment Proof</Label>
              <div className="rounded-xl border border-dashed p-5 text-center bg-muted/20">
                {preview ? (
                  <div className="space-y-3">
                    <img
                      src={preview}
                      alt="Payment slip preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-sm text-muted-foreground">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : "Upload a PNG, JPG, or PDF receipt"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes for Admin</Label>
              <Textarea
                id="payment-notes"
                placeholder="Optional note about who made the payment or when it was sent"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  Your session will remain pending until an admin reviews the uploaded payment proof.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!file || loading}
            >
              {loading ? "Uploading..." : "Submit Payment Details"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
