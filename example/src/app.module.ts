import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import modules from './modules';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ...modules],
  controllers: [],
  providers: []
})
export class AppModule {}
