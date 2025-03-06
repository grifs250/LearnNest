import { Metadata } from "next";
import ClientRegisterPage from './client';

// Generate metadata
export const metadata: Metadata = {
  title: "Reģistrēties | MāciesTe",
  description: "Pievienojieties MāciesTe platformai, lai sāktu mācīties vai mācīt citus.",
};

export default function RegisterPage() {
  return <ClientRegisterPage />;
}