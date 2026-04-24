import { Global, Module } from '@nestjs/common';

import { ToolRegistry } from './tool-registry.service';

@Global()
@Module({
  providers: [ToolRegistry],
  exports: [ToolRegistry],
})
export class ToolsModule {}
