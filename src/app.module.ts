import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';
import { UserSubscriptionsModule } from './modules/user-subscriptions/user-subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MoviesModule } from './modules/movies/movies.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, UsersModule, ProfilesModule, SubscriptionPlansModule, UserSubscriptionsModule, PaymentsModule, CategoriesModule, MoviesModule, FavoritesModule, ReviewsModule, WatchHistoryModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
