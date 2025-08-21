// ARQUIVO COMPLETO: src/app/components/relatorio/relatorio.component.ts

import { Component, HostListener, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartType } from 'chart.js';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Subscription } from 'rxjs';

// NOVOS IMPORTS PARA O PDF
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- SERVIÇOS E MODELOS ---
import { DashboardDataService } from '../../../services/dashboard-data.service';
import { AuthService } from '../../../services/auth.service';
import { Usuario, Propriedade, Producao, Financeiro } from '../../../models/api.models';

registerLocaleData(localePt);

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.css']
})
export class RelatorioComponent implements OnInit, OnDestroy {
  // --- Propriedades do Componente ---
  menuAberto = false;
  usuarioNome: string = '';
  usuarioFoto: string = 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
  propriedades: Propriedade[] = [];
  producoes: Producao[] = [];
  movimentacoes: Financeiro[] = [];
  selectedPropertyId: string = 'todos';
  startDate: string = '';
  endDate: string = '';
  selectedCropType: string = 'todos';
  reportType: 'productivity' | 'financial' | 'crop_production' = 'productivity';
  availableCropTypes: { value: string, text: string }[] = [];
  @ViewChild('reportChartCanvas', { static: true }) reportChartCanvas!: ElementRef<HTMLCanvasElement>;
  reportChart: Chart | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private dashboardDataService: DashboardDataService,
    private authService: AuthService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.usuarioNome = user.nome;
        this.usuarioFoto = user.fotoPerfil || 'https://placehold.co/40x40/aabbcc/ffffff?text=User';
      }
    });
    this.carregarDadosIniciais();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  carregarDadosIniciais(): void {
    this.dashboardDataService.carregarDadosDashboard().subscribe({
      next: (data) => {
        const { propriedades, producoes, movimentacoes } = data;
        this.propriedades = propriedades;
        this.producoes = producoes;
        this.movimentacoes = movimentacoes.map(rec => ({ ...rec, data: new Date(rec.data) }));
        const uniqueCropTypes = new Set<string>(this.producoes.map(prod => prod.cultura));
        this.availableCropTypes = [];
        Array.from(uniqueCropTypes).sort().forEach(type => {
          this.availableCropTypes.push({ value: type, text: type });
        });
        this.gerarRelatorio();
      },
      error: (err) => console.error('Erro ao carregar dados iniciais para o relatório:', err)
    });
  }

  onReportTypeChange(): void {
    if (this.reportType !== 'financial') {
      this.startDate = '';
      this.endDate = '';
    }
    if (this.reportType === 'financial') {
      this.selectedCropType = 'todos';
    }
    this.gerarRelatorio();
  }

  gerarRelatorio(): void {
    this.reportChart?.destroy();
    const ctx = this.reportChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // ✅ Correção: agora filtrando por propriedadeId
    const filteredProducoes = this.producoes.filter(prod =>
      (this.selectedPropertyId === 'todos' || prod.propriedadeId === this.selectedPropertyId) &&
      (this.selectedCropType === 'todos' || prod.cultura === this.selectedCropType)
    );

    const filteredMovimentacoes = this.movimentacoes.filter(mov =>
      (this.selectedPropertyId === 'todos' || mov.propriedadeId === this.selectedPropertyId) &&
      (!this.startDate || mov.data >= new Date(this.startDate)) &&
      (!this.endDate || mov.data <= new Date(this.endDate))
    );

    let labels: string[] = [];
    let datasets: any[] = [];
    let chartTitle: string = '';
    let chartType: ChartType = 'bar';

    switch (this.reportType) {
      case 'productivity':
        chartTitle = 'Produtividade por Cultura (kg/ha)';
        const productivityData = new Map<string, { totalYield: number, properties: Set<string> }>();
        filteredProducoes.forEach(prod => {
          if (!productivityData.has(prod.cultura)) {
            productivityData.set(prod.cultura, { totalYield: 0, properties: new Set() });
          }
          const data = productivityData.get(prod.cultura)!;
          data.totalYield += (prod.produtividade || 0);
          data.properties.add(prod.propriedadeId);
        });
        labels = Array.from(productivityData.keys()).sort();
        const productivityValues = labels.map(label => {
          const item = productivityData.get(label)!;
          const totalArea = Array.from(item.properties).reduce((sum, propId) => {
            const prop = this.propriedades.find(p => p.id === propId);
            return sum + (prop?.area_ha || 0);
          }, 0);
          return totalArea > 0 ? item.totalYield / totalArea : 0;
        });
        datasets = [{ label: 'Produtividade (kg/ha)', data: productivityValues, backgroundColor: 'rgba(75, 192, 192, 0.6)' }];
        break;

      case 'financial':
        chartTitle = 'Resultado Financeiro';
        chartType = 'bar';
        const totalRevenue = filteredMovimentacoes.filter(r => r.tipo === 'receita').reduce((sum, r) => sum + r.valor, 0);
        const totalExpense = filteredMovimentacoes.filter(r => r.tipo === 'despesa').reduce((sum, r) => sum + r.valor, 0);
        labels = ['Receitas', 'Despesas', 'Lucro/Prejuízo'];
        datasets = [{
          label: 'Valor (R$)',
          data: [totalRevenue, totalExpense, totalRevenue - totalExpense],
          backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)', 'rgba(0, 123, 255, 0.7)'],
        }];
        break;

      case 'crop_production':
        chartTitle = 'Produção Total por Cultura (kg)';
        const cropProductionData = new Map<string, number>();
        filteredProducoes.forEach(prod => {
          const currentYield = cropProductionData.get(prod.cultura) || 0;
          cropProductionData.set(prod.cultura, currentYield + (prod.produtividade || 0));
        });
        labels = Array.from(cropProductionData.keys()).sort();
        datasets = [{ label: 'Produção (kg)', data: labels.map(label => cropProductionData.get(label)), backgroundColor: 'rgba(153, 102, 255, 0.6)' }];
        break;
    }

    this.reportChart = new Chart(ctx, {
      type: chartType,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: chartTitle, font: { size: 18 } },
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.y !== null) {
                  const value = context.parsed.y;
                  if (this.reportType === 'financial') {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                  } else {
                    label += new Intl.NumberFormat('pt-BR').format(value) + (this.reportType === 'productivity' ? ' kg/ha' : ' kg');
                  }
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: this.getAxisYTitle(this.reportType) },
            ticks: {
              callback: (value: any) => typeof value === 'number' ? new Intl.NumberFormat('pt-BR', { style: this.reportType === 'financial' ? 'currency' : 'decimal', currency: 'BRL' }).format(value) : value
            }
          },
          x: {
            title: { display: true, text: this.getAxisXTitle(this.reportType) }
          }
        }
      }
    });
  }

  // MÉTODO PARA EXPORTAR O RELATÓRIO COMO PDF
  async exportarRelatorioPDF(): Promise<void> {
    const reportContentElement = document.getElementById('report-content');
    if (!reportContentElement) {
      console.error("Elemento 'report-content' não encontrado para exportar o PDF.");
      return;
    }

    document.body.classList.add('generating-pdf');
    
    const canvas = await html2canvas(reportContentElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    document.body.classList.remove('generating-pdf');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);

    const finalImgWidth = canvasWidth * ratio * 0.95;
    const finalImgHeight = canvasHeight * ratio * 0.95;
    const x = (pdfWidth - finalImgWidth) / 2;
    const y = (pdfHeight - finalImgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);

    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const nomeArquivo = `Relatorio_FAVEP_${this.reportType}_${dataAtual}.pdf`;
    
    pdf.save(nomeArquivo);
  }

  // --- Métodos Auxiliares ---
  getAxisYTitle(reportType: string): string {
    const titles: { [key: string]: string } = {
      productivity: 'Produtividade (kg/ha)',
      financial: 'Valor (R$)',
      crop_production: 'Produção (kg)'
    };
    return titles[reportType] || 'Valor';
  }

  getAxisXTitle(reportType: string): string {
    const titles: { [key: string]: string } = {
      productivity: 'Culturas',
      financial: 'Categorias',
      crop_production: 'Culturas'
    };
    return titles[reportType] || '';
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  @HostListener('document:click', ['$event'])
  fecharMenuFora(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.menuAberto && !target.closest('.main-menu') && !target.closest('.menu-toggle')) {
      this.menuAberto = false;
    }
  }
}
