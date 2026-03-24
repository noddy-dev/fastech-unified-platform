import { TenantLayout } from '@/components/layouts/TenantLayout';
import { PatchManagementContent } from '@/components/PatchManagementContent';

export default function TenantPatchManagementPage() {
  return (
    <TenantLayout>
      <PatchManagementContent />
    </TenantLayout>
  );
}
