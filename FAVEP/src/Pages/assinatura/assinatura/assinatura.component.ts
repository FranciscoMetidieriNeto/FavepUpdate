import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaces para organizar o código
interface MercadoPagoResponse {
  init_point: string;
}

interface Plan {
  tipo: string;
  valor: number;
}

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [],
  templateUrl: './assinatura.component.html',
  styleUrl: './assinatura.component.css'
})
export class AssinaturaComponent {

  constructor(private http: HttpClient) {}

  /**
   * Este método lida com os planos PAGOS, enviando para o Mercado Pago.
   */
  async handleSubscription(plan: Plan, event: MouseEvent) {
    const button = event.target as HTMLButtonElement;
    button.textContent = 'Aguarde...';
    button.disabled = true;

    try {
      const url = `${environment.apiUrl}/api/mercado-pago/create-subscription`;
      console.log(`Enviando para o back-end:`, plan);

      const request$ = this.http.post<MercadoPagoResponse>(url, plan);
      const data = await lastValueFrom(request$);

      if (data && data.init_point) {
        window.location.href = data.init_point;
      } else {
        // ... (código de erro)
      }
    } catch (error) {
      // ... (código de erro)
    }
  }

  /**
   * NOVO MÉTODO: Lida com a assinatura do plano GRATUITO.
   * Não vai para o Mercado Pago.
   */
  handleFreeSubscription() {
    console.log('Usuário selecionou o plano gratuito.');
    alert('Plano gratuito ativado com sucesso!');

    // LÓGICA FUTURA:
    // Aqui você faria uma chamada para uma OUTRA rota do seu back-end,
    // por exemplo: /api/users/activate-free-plan
    // para registrar que o usuário ativou o plano gratuito no seu banco de dados.
    //
    // Exemplo:
    // this.http.post(`${environment.apiUrl}/api/activate-free`, {}).subscribe(response => {
    //   console.log('Plano gratuito ativado no servidor.');
    //   // Redirecionar para o painel do usuário, etc.
    // });
  }
}