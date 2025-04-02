"use client";

export default function ErrorDisplay() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Kļūda ielādējot profilu</h1>
      <p className="mb-6">Radās problēma ielādējot lietotāja profilu. Lūdzu, mēģiniet vēlreiz.</p>
      <button 
        className="btn btn-primary" 
        onClick={handleRefresh}
      >
        Mēģināt vēlreiz
      </button>
    </div>
  );
} 