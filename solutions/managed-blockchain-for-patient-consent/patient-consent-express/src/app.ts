import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';
import Metadata from '@amzn/workbench-core-audit/lib/metadata';
import { Request, Response, Router } from 'express';
import AuditLogger from './auditLogger';
import { logger } from './loggingService';
import ConsentRoute from './routes/consentRoute';
import OrganizationRoute from './routes/organizationRoute';
import PatientRoute from './routes/patientRoute';

const writer: Writer = new AuditLogger(logger);
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const auditService: AuditService = new AuditService(baseAuditPlugin, true);

export const mainRouter: Router = Router();

const patientRoute: PatientRoute = new PatientRoute();

const organizationRoute: OrganizationRoute = new OrganizationRoute();

const cosentRoute: ConsentRoute = new ConsentRoute();

mainRouter.use('/patient', patientRoute.router);

mainRouter.use('/organization', organizationRoute.router);

mainRouter.use('/consent', cosentRoute.router);
