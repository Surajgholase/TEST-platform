"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Company {
  id: string;
  name: string;
  is_active: boolean;
}

export default function CompanySelectPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (data) {
      setCompanies(data);
    }
    setLoading(false);
  };

  const handleSelectCompany = (companyId: string) => {
    router.push(`/student/tests/company/difficulty?companyId=${companyId}`);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Company-Wise Test</h1>
        <p className="text-muted-foreground">Select a company</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No companies available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectCompany(company.id)}
            >
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Select</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
