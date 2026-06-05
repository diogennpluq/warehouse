// +build ignore

// Скрипт для генерации шаблона Excel НМЦК
// Запуск: go run generate_template.go

package main

import (
	"fmt"
	"log"

	"github.com/qax-os/excelize/v2"
)

func main() {
	f := excelize.NewFile()
	sheet := "Лист1"

	// === СТИЛИ ===
	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 14, Family: "Times New Roman"},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 10, Family: "Times New Roman"},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#E0E0E0"}, Pattern: 1},
		Border:    []excelize.Border{{Type: "left", Color: "000000", Style: 1}, {Type: "right", Color: "000000", Style: 1}, {Type: "top", Color: "000000", Style: 1}, {Type: "bottom", Color: "000000", Style: 1}},
	})

	normalStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Size: 10, Family: "Times New Roman"},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border:    []excelize.Border{{Type: "left", Color: "000000", Style: 1}, {Type: "right", Color: "000000", Style: 1}, {Type: "top", Color: "000000", Style: 1}, {Type: "bottom", Color: "000000", Style: 1}},
	})

	centerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Size: 10, Family: "Times New Roman"},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border:    []excelize.Border{{Type: "left", Color: "000000", Style: 1}, {Type: "right", Color: "000000", Style: 1}, {Type: "top", Color: "000000", Style: 1}, {Type: "bottom", Color: "000000", Style: 1}},
	})

	// === ШАПКА ===
	f.MergeCell(sheet, "A1", "K1")
	f.SetCellValue(sheet, "A1", "ОБОСНОВАНИЕ НАЧАЛЬНОЙ (МАКСИМАЛЬНОЙ) ЦЕНЫ КОНТРАКТА")
	f.SetCellStyle(sheet, "A1", "K1", titleStyle)
	f.SetRowHeight(sheet, 1, 30)

	f.MergeCell(sheet, "A2", "K2")
	f.SetCellValue(sheet, "A2", "(Приложение № 2 к документации о закупке)")
	f.SetCellStyle(sheet, "A2", "K2", normalStyle)
	f.SetRowHeight(sheet, 2, 20)

	// === ИНФОРМАЦИЯ О ЗАКУПКЕ ===
	f.SetCellValue(sheet, "A4", "Наименование закупки:")
	f.MergeCell(sheet, "B4", "K4")
	f.SetCellValue(sheet, "B4", "{{ProcurementTitle}}")

	f.SetCellValue(sheet, "A5", "Идентификационный код закупки (ИКЗ):")
	f.MergeCell(sheet, "B5", "K5")
	f.SetCellValue(sheet, "B5", "{{IKZ}}")

	// === ТАБЛИЦА ===
	headers := []string{"№ п/п", "Наименование объекта закупки", "Ед. изм.", "Предложение 1", "Предложение 2", "Предложение 3", "Средняя цена", "Количество", "Итого (руб.)"}
	for i, h := range headers {
		cell := fmt.Sprintf("%c7", 'A'+i)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}
	f.SetRowHeight(sheet, 7, 40)

	// === СТРОКА ДАННЫХ (пример) ===
	row := 8
	f.SetCellValue(sheet, fmt.Sprintf("A%d", row), 1)
	f.SetCellValue(sheet, fmt.Sprintf("B%d", row), "{{ItemName}}")
	f.SetCellValue(sheet, fmt.Sprintf("C%d", row), "{{UOM}}")
	f.SetCellValue(sheet, fmt.Sprintf("D%d", row), "{{Price1}}")
	f.SetCellValue(sheet, fmt.Sprintf("E%d", row), "{{Price2}}")
	f.SetCellValue(sheet, fmt.Sprintf("F%d", row), "{{Price3}}")
	
	// Формула средней цены
	f.SetCellValue(sheet, fmt.Sprintf("G%d", row), fmt.Sprintf("=AVERAGE(D%d:F%d)", row, row))
	
	f.SetCellValue(sheet, fmt.Sprintf("H%d", row), "{{Quantity}}")
	
	// Формула итога
	f.SetCellValue(sheet, fmt.Sprintf("I%d", row), fmt.Sprintf("=G%d*H%d", row, row))

	for col := 'A'; col <= 'I'; col++ {
		cell := fmt.Sprintf("%c%d", col, row)
		f.SetCellStyle(sheet, cell, cell, centerStyle)
	}
	f.SetRowHeight(sheet, row, 25)

	// === ИТОГО ===
	totalRow := 9
	f.MergeCell(sheet, fmt.Sprintf("A%d", totalRow), fmt.Sprintf("H%d", totalRow))
	f.SetCellValue(sheet, fmt.Sprintf("A%d", totalRow), "ИТОГО начальная (максимальная) цена контракта:")
	f.SetCellStyle(sheet, fmt.Sprintf("A%d", totalRow), fmt.Sprintf("A%d", totalRow), &excelize.Style{Font: &excelize.Font{Bold: true, Size: 11}})
	
	f.SetCellValue(sheet, fmt.Sprintf("I%d", totalRow), fmt.Sprintf("=SUM(I%d:I%d)", row, row))
	f.SetCellStyle(sheet, fmt.Sprintf("I%d", totalRow), fmt.Sprintf("I%d", totalRow), centerStyle)

	// === ИНФОРМАЦИЯ О ПОСТАВЩИКАХ ===
	infoRow := 12
	f.SetCellValue(sheet, fmt.Sprintf("A%d", infoRow), "Информация о поставщиках:")
	f.SetCellStyle(sheet, fmt.Sprintf("A%d", infoRow), fmt.Sprintf("A%d", infoRow), &excelize.Style{Font: &excelize.Font{Bold: true, Size: 10}})

	// Поставщик 1
	f.SetCellValue(sheet, fmt.Sprintf("A%d", infoRow+1), "1. Наименование:")
	f.SetCellValue(sheet, fmt.Sprintf("B%d", infoRow+1), "{{Provider1_Name}}")
	f.SetCellValue(sheet, fmt.Sprintf("A%d", infoRow+2), "   ИНН:")
	f.SetCellValue(sheet, fmt.Sprintf("B%d", infoRow+2), "{{Provider1_INN}}")
	f.SetCellValue(sheet, fmt.Sprintf("A%d", infoRow+3), "   Дата КП:")
	f.SetCellValue(sheet, fmt.Sprintf("B%d", infoRow+3), "{{Provider1_Date}}")

	// Поставщик 2
	f.SetCellValue(sheet, fmt.Sprintf("D%d", infoRow+1), "2. Наименование:")
	f.SetCellValue(sheet, fmt.Sprintf("E%d", infoRow+1), "{{Provider2_Name}}")
	f.SetCellValue(sheet, fmt.Sprintf("D%d", infoRow+2), "   ИНН:")
	f.SetCellValue(sheet, fmt.Sprintf("E%d", infoRow+2), "{{Provider2_INN}}")
	f.SetCellValue(sheet, fmt.Sprintf("D%d", infoRow+3), "   Дата КП:")
	f.SetCellValue(sheet, fmt.Sprintf("E%d", infoRow+3), "{{Provider2_Date}}")

	// Поставщик 3
	f.SetCellValue(sheet, fmt.Sprintf("G%d", infoRow+1), "3. Наименование:")
	f.SetCellValue(sheet, fmt.Sprintf("H%d", infoRow+1), "{{Provider3_Name}}")
	f.SetCellValue(sheet, fmt.Sprintf("G%d", infoRow+2), "   ИНН:")
	f.SetCellValue(sheet, fmt.Sprintf("H%d", infoRow+2), "{{Provider3_INN}}")
	f.SetCellValue(sheet, fmt.Sprintf("G%d", infoRow+3), "   Дата КП:")
	f.SetCellValue(sheet, fmt.Sprintf("H%d", infoRow+3), "{{Provider3_Date}}")

	// === КОЭФФИЦИЕНТ ВАРИАЦИИ ===
	cvRow := 18
	f.SetCellValue(sheet, fmt.Sprintf("A%d", cvRow), "Расчет коэффициента вариации:")
	f.SetCellStyle(sheet, fmt.Sprintf("A%d", cvRow), fmt.Sprintf("A%d", cvRow), &excelize.Style{Font: &excelize.Font{Bold: true, Size: 10}})
	
	f.SetCellValue(sheet, fmt.Sprintf("A%d", cvRow+1), "Среднее квадратическое отклонение (σ):")
	f.SetCellValue(sheet, fmt.Sprintf("B%d", cvRow+1), fmt.Sprintf("=STDEV.S(D%d:F%d)", row, row))
	f.SetCellValue(sheet, fmt.Sprintf("A%d", cvRow+2), "Коэффициент вариации (V):")
	f.SetCellValue(sheet, fmt.Sprintf("B%d", cvRow+2), fmt.Sprintf("=(B%d/AVERAGE(D%d:F%d))*100", cvRow+1, row, row))
	f.SetCellValue(sheet, fmt.Sprintf("A%d", cvRow+3), "Однородность цен (V ≤ 33%):")
	f.SetCellValue(sheet, fmt.Sprintf("B%d", cvRow+3), fmt.Sprintf("=IF(B%d<=33, \"ДА\", \"НЕТ\")", cvRow+2))

	// === ПОДПИСИ ===
	signRow := 25
	f.SetCellValue(sheet, fmt.Sprintf("A%d", signRow), "Ответственный за закупку:")
	f.SetCellValue(sheet, fmt.Sprintf("D%d", signRow), "_________________ / {{ResponsibleName}} /")
	f.SetCellValue(sheet, fmt.Sprintf("A%d", signRow+1), "Дата:")
	f.SetCellValue(sheet, fmt.Sprintf("D%d", signRow+1), "{{CurrentDate}}")

	// === НАСТРОЙКИ ===
	colWidths := map[string]float64{
		"A": 8, "B": 35, "C": 12, "D": 18, "E": 18, "F": 18, "G": 15, "H": 12, "I": 15,
	}
	for col, width := range colWidths {
		f.SetColWidth(sheet, col, col, width)
	}

	f.SetPageLayout(sheet, excelize.PageLayoutOrientation("landscape"), excelize.PageLayoutPaperSize(9))

	// Сохраняем
	if err := f.SaveAs("nmcc_template.xlsx"); err != nil {
		log.Fatal(err)
	}

	fmt.Println("✅ Шаблон успешно создан: nmcc_template.xlsx")
}
