import dayjs from 'dayjs';
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';

import { extendSalmonResult } from '@/extend-salmon-result';
import { BossId, PlayerId } from '@/types/salmon-result';
import { ExtendedSalmonResult, TotalResult, BossIdKeys } from '@/types/parsed-salmon-result';

@Component({
  name: 'SalmonResult',
})
export default class SalmonResult extends Vue {
  public salmonResult: ExtendedSalmonResult | null = null;
  public bossIds: number[] = [3, 6, 9, 12, 13, 14, 15, 16, 21];

  public img(type: string, id: string|number): string {
    return `https://splatoon-stats-api.yuki.games/static/images/${type}/${id}.png`;
  }
  public convertEpoch(time: number): string {
    return dayjs.unix(time).utc().local().format('YYYY-MM-DD HH:mm:ss');
  }
  public isRegistered(playerId: PlayerId): boolean {
    return this.salmonResult!.member_accounts.some((member: any) =>
      member && member.player_id === playerId);
  }
  public getPlayerAvatar(playerId: PlayerId): string | null {
    const user = this.salmonResult!.member_accounts.find((member) =>
      member && member.player_id === playerId);
    return user ? user.twitter_avatar : null;
  }
  public getPlayerName(playerId: PlayerId): string {
    const user = this.salmonResult!.member_accounts.find((member) =>
      member && member.player_id === playerId);
    return user ? user.name : playerId;
  }
  public hasMost(key: keyof TotalResult, value: number): boolean {
    return this.salmonResult!.highest[key] === value;
  }
  public totalBossElimination(bossId: BossIdKeys): number {
    return this.salmonResult!.player_results.reduce(
      (sum: number, p) => sum + p.boss_eliminations.counts[bossId],
      0,
    );
  }
  public totalBossSpawn(bossId: BossIdKeys): number {
    return this.salmonResult!.boss_appearances[bossId];
  }
  public toPlayerSummary(playerId: PlayerId) {
    this.$router.push({ name: 'playerSummary', params: { playerId } });
  }

  protected mounted() {
    const id = this.$route.params.resultId;
    axios.get(`http://localhost/api/results/${id}`)
      .then((res: any) => {
        this.salmonResult = extendSalmonResult(res.data);
      });
  }
}