import dayjs from 'dayjs';
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';

import MainWeapon from '@/components/MainWeapon.vue';
import PlayerAvatar from '@/components/PlayerAvatar.vue';
import ProportionalBarChart from '@/components/ProportionalBarChart.vue';
import SpecialUsage from '@/components/SpecialUsage.vue';
import { extendSalmonResult } from '@/extend-salmon-result';
import { BossId, PlayerId } from '@/types/salmon-result';
import { ExtendedSalmonResult, TotalResult, BossIdKeys } from '@/types/parsed-salmon-result';
import { weaponIcon } from '../helper';

@Component({
  name: 'SalmonResult',
  components: { MainWeapon, PlayerAvatar, ProportionalBarChart, SpecialUsage },
})
export default class SalmonResult extends Vue {
  public salmonResult: ExtendedSalmonResult | null = null;
  public bossIds: number[] = [3, 6, 9, 12, 13, 14, 15, 16, 21];

  get appearedBossIds(): BossId[] {
    return this.bossIds.filter((bossId) => this.totalBossSpawn(bossId) > 0);
  }

  public specialsUsedInWave(wave: number) {
    return this.salmonResult!.player_results
      .map((player) => {
        return {
          id: player.special_id,
          count: player.special_uses[wave - 1].count,
        };
      })
      .flat();
  }
  public weaponIcon = weaponIcon;
  public convertEpoch(time: number): string {
    return dayjs.unix(time).utc().local().format('YYYY-MM-DD HH:mm:ss');
  }
  public isRegistered(playerId: PlayerId): boolean {
    return !!this.getAccountByPlayerId(playerId);
  }
  public getPlayerAvatar(playerId: PlayerId): string | null {
    const user = this.getAccountByPlayerId(playerId);
    return user ? user.twitter_avatar : null;
  }
  public getPlayerName(playerId: PlayerId): string {
    const user = this.salmonResult!.member_accounts.find((member) =>
      member && member.player_id === playerId);
    return user ? user.name : playerId;
  }
  public hasMost(key: keyof TotalResult, value: number, bossId?: number): boolean {
    if (value === 0) {
      return false;
    } else if (key === 'boss_eliminations') {
      return this.salmonResult!.highest[key][bossId] === value;
    }
    return this.salmonResult!.highest[key] === value;
  }
  public hasLeastDeath(value: number): boolean {
    return value === Math.min(...this.salmonResult!.player_results.map(p => p.death));
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
  public getAccountByPlayerId(playerId: PlayerId) {
    return this.salmonResult!.member_accounts.find((member) =>
      member && member.player_id === playerId);
  }

  protected mounted() {
    const id = this.$route.params.resultId;
    axios.get(`http://localhost/api/results/${id}`)
      .then((res: any) => {
        this.salmonResult = extendSalmonResult(res.data);
      });
  }
}
