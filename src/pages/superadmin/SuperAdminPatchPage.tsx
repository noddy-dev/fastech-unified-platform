import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { PatchManagementContent } from '@/components/PatchManagementContent';

export default function SuperAdminPatchPage() {
  return (
    <SuperAdminLayout>
      <PatchManagementContent />
    </SuperAdminLayout>
  );
}
