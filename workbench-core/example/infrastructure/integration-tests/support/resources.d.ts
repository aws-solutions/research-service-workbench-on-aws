import ClientSession from './clientSession';
import Datasets from './resources/datasets/datasets';
declare function getResources(clientSession: ClientSession): Resources;
interface Resources {
  datasets: Datasets;
}
export { getResources, Resources };
//# sourceMappingURL=resources.d.ts.map
