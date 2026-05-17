import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';

@Module({
  providers: [MenuItemsService],
  controllers: [MenuItemsController],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
