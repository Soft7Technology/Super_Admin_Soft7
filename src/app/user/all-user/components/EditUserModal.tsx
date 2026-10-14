"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { User } from "../types";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdated: (updatedUser: Partial<User>) => void;
}

export function EditUserModal({ user, onClose, onUpdated }: EditUserModalProps) {
  const [name,    setName]    = useState(user.name  || "");
  const [email,   setEmail]   = useState(user.email || "");
  const [phone,   setPhone]   = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateUser = async () => {
    if (!name || !email || !phone) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.patch(
        `/v1/super-admin/companies/${user.companyId}/users/${user.id}`,
        {
          name,
          email,
          phone,
        },
      );

      if (data.success) {
        onUpdated({ name, email, phone });
        onClose();
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error: any) {
      console.error("Update User Error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit User"
      description="Update user details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} isLoading={loading}>
            Update User
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
    </Modal>
  );
}
