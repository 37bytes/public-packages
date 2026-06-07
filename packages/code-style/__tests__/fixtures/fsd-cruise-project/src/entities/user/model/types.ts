export {};
import { auth } from '@/features/auth'; // fsd: layers-entities-up
import { Session } from '@/entities/session'; // fsd: no-cross-slice
import { Button } from '@/shared/ui'; // fsd: clean
import { User as SelfUser } from '@/entities/user'; // fsd: no-slice-self-import
