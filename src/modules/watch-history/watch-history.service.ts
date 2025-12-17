import { Injectable } from '@nestjs/common';
import { CreateWatchHistoryDto } from './dto/create-watch-history.dto';
import { UpdateWatchHistoryDto } from './dto/update-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  create(createWatchHistoryDto: CreateWatchHistoryDto) {
    return 'This action adds a new watchHistory';
  }

  findAll() {
    return `This action returns all watchHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} watchHistory`;
  }

  update(id: number, updateWatchHistoryDto: UpdateWatchHistoryDto) {
    return `This action updates a #${id} watchHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} watchHistory`;
  }
}
