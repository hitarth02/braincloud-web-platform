import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { createUserService } from "../../services/userService";

interface UserFormPageProps {
  service: ReturnType<typeof createUserService>;
  basePath: string;
  entityLabel: string;
}

const createSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

const editSchema = createSchema.omit({ password: true, email: true });

type FormErrors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "phone", string>>;

export const UserFormPage = ({ service, basePath, entityLabel }: UserFormPageProps) => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      service
        .getById(id!)
        .then((user) =>
          setForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: "",
            phone: user.phone || "",
          })
        )
        .catch(() => toast.error("Failed to load record"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const schema = isEdit ? editSchema : createSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof FormErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      if (isEdit) {
        await service.update(id!, {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        });
        toast.success(`${entityLabel} updated successfully`);
      } else {
        await service.create(form);
        toast.success(`${entityLabel} created successfully`);
      }
      navigate(basePath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl space-y-6">
      <button
        onClick={() => navigate(basePath)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {entityLabel}s
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? `Edit ${entityLabel}` : `Create ${entityLabel}`}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              error={errors.firstName}
            />
            <FormInput
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              error={errors.lastName}
            />
          </div>
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            disabled={isEdit}
          />
          {!isEdit && (
            <FormInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              placeholder="At least 6 characters"
            />
          )}
          <FormInput
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(basePath)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? "Save Changes" : `Create ${entityLabel}`}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
