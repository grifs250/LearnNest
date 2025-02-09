"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, orderBy, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import PaymentStatus from "@/components/PaymentStatus";

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  lessonId: string;
  lessonTitle: string;
  teacherName: string;
  studentName: string;
  createdAt: string;
  paymentMethod?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const loadUserAndPayments = async () => {
      if (!auth.currentUser) {
        router.push('/auth');
        return;
      }

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setIsTeacher(!!userDoc.data().isTeacher);
        // Fetch payments based on user role
        const paymentsQuery = query(
          collection(db, "payments"),
          where(isTeacher ? "teacherId" : "studentId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        const paymentsList: Payment[] = paymentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Payment));
        setPayments(paymentsList);
      }
      setLoading(false);
    };

    loadUserAndPayments();
  }, [router, isTeacher]);

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, status: newStatus as any } : payment
    ));
  };

  if (loading) return <div className="flex justify-center">
    <span className="loading loading-spinner loading-md"></span>
  </div>;

  if (error) return <div className="text-error">{error}</div>;

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="text-center text-muted-foreground">Nav maksājumu vēstures</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Datums</th>
              <th>Nodarbība</th>
              <th>{isTeacher ? 'Skolēns' : 'Pasniedzējs'}</th>
              <th>Summa</th>
              <th>Statuss</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.createdAt).toLocaleDateString('lv')}</td>
                <td>{payment.lessonTitle}</td>
                <td>{isTeacher ? payment.studentName : payment.teacherName}</td>
                <td>€{payment.amount.toFixed(2)}</td>
                <td>
                  <PaymentStatus
                    paymentId={payment.id}
                    status={payment.status}
                    amount={payment.amount}
                    onStatusChange={(newStatus) => handleStatusChange(payment.id, newStatus)}
                    isEditable={isTeacher}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 