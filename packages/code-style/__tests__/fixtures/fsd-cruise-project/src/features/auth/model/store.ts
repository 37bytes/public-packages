export {};
import { home } from '@/pages/home'; // fsd: layers-features-up
import { search } from '@/features/search'; // fsd: no-cross-slice
import { User } from '@/entities/user'; // fsd: clean
import { UserType } from '@/entities/user/model/types'; // fsd: no-deep-into-slice-from-slice
import { cn } from '@/shared/lib/classNames'; // fsd: clean
import { merge } from '@/shared/lib/classNames/utils'; // fsd: no-deep-into-shared
import { SharedButton } from '@/shared/ui/Button'; // fsd: no-deep-into-shared
import { sharedUi } from '@/shared/ui'; // fsd: clean
import { api } from '@/shared/api/base'; // fsd: clean
import { theme } from '@/shared/config/theme'; // fsd: no-deep-into-shared
import { userForSession } from '@/entities/user/@x'; // fsd: clean
import { userForSession as u2 } from '@/entities/user/@x/session'; // fsd: clean
